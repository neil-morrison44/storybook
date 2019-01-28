import * as React from 'react';
import * as PropTypes from 'prop-types';
import { types } from '@storybook/addons';
import { styled } from '@storybook/theming';
import { STORY_CHANGED } from '@storybook/core-events';

import { SyntaxHighlighter as SyntaxHighlighterBase, Placeholder } from '@storybook/components';
import Giphy from './giphy';
import Markdown from 'markdown-to-jsx';

import { PARAM_KEY, API, Parameters } from './shared';

const Panel = styled.div({
  padding: 10,
  boxSizing: 'border-box',
  width: '100%',
});

interface Props {
  active: boolean;
  api: API;
}

interface NotesPanelState {
  value?: string;
}

function read(param: Parameters | undefined): string | undefined {
  if (!param) {
    return undefined;
  } else if (typeof param === 'string') {
    return param;
  } else if ('disabled' in param) {
    return undefined;
  } else if ('text' in param) {
    return param.text;
  } else if ('markdown' in param) {
    return param.markdown;
  }
}

const SyntaxHighlighter = (props: any) => <SyntaxHighlighterBase bordered copyable {...props} />;

const defaultOptions = {
  overrides: {
    code: SyntaxHighlighter,
    Giphy: {
      component: Giphy,
    },
  },
};

export default class NotesPanel extends React.Component<Props, NotesPanelState> {
  static propTypes = {
    active: PropTypes.bool.isRequired,
    api: PropTypes.shape({
      on: PropTypes.func,
      off: PropTypes.func,
      emit: PropTypes.func,

      getParameters: PropTypes.func,
    }).isRequired,
  };

  readonly state: NotesPanelState = {
    value: '',
  };

  mounted: boolean;

  // use our SyntaxHighlighter component in place of a <code> element when
  // converting markdown to react elements

  componentDidMount() {
    const { api } = this.props;
    api.on(STORY_CHANGED, this.onStoryChange);
  }

  componentWillUnmount() {
    const { api } = this.props;
    api.off(STORY_CHANGED, this.onStoryChange);
  }

  onStoryChange = (id: string) => {
    const { api } = this.props;
    const params = api.getParameters(id, PARAM_KEY);

    const value = read(params);
    if (value) {
      this.setState({ value });
    } else {
      this.setState({ value: undefined });
    }
  };

  render() {
    const { active, api } = this.props;
    const { value } = this.state;

    if (!active) {
      return null;
    }

    // TODO: memoize
    const extraElements = Object.entries(api.getElements(types.NOTES_ELEMENT)).reduce((acc, [k, v]) => ({ ...acc, [k]: v.render }), {});
    const options = { ...defaultOptions, overrides: { ...defaultOptions.overrides, ...extraElements } };

    return value ? (
      <Panel className="addon-notes-container">
        <Markdown options={options}>{value}</Markdown>
      </Panel>
    ) : (
      <Placeholder>There is no info/note</Placeholder>
    );
  }
}
