const rid = () => Math.random().toString(36).slice(2, 10);

const defaultLayout = {
  id: 'layout-default',
  name: 'Starter Layout',
  domain: 'generic',
  nodes: [
    {
      id: rid(),
      type: 'page',
      props: { title: 'Starter Screen' },
      children: [
        {
          id: rid(),
          type: 'section',
          props: { title: 'Overview' },
          children: [
            { id: rid(), type: 'text', props: { value: 'Welcome to NewGen Studio.' } },
            { id: rid(), type: 'button', props: { label: 'Primary Action', variant: 'primary' } },
          ],
        },
      ],
    },
  ],
};

const layouts = new Map();

export function getLayout(layoutId = 'current') {
  const found = layouts.get(layoutId) || defaultLayout;
  return JSON.parse(JSON.stringify(found));
}

export function saveLayout(layoutId = 'current', layout) {
  const toStore = layout && typeof layout === 'object' ? layout : defaultLayout;
  layouts.set(layoutId, toStore);
  return JSON.parse(JSON.stringify(toStore));
}
