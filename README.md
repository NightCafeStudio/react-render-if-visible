# React RenderIfVisible
Harness the power of Intersection Observers for simple list virtualization in React

This tiny React component is a drop-in list virtualization alternative that defers rendering of its children until it is on or near the screen. Unlike other virtualization libraries, it takes about one minute to integrate and doesn't require you to change your code other than wrapping each item in `<RenderIfVisible></RenderIfVisible>`.

It works equally well with responsive item heights, responsive grids, non-flat lists, and any other HTML that would normally make other virtualization libraries complicated to implement.

This solution has been used successfully in production on [NightCafe Creator](https://creator.nightcafe.studio) for 9+ months.

## Install and integrate in 1 minute

First, install the component from npm.

```bash
npm install react-render-if-visible --save
```

Then, import the component and wrap each child with it.

```javascript
import React from 'react'
import RenderIfVisible from 'react-render-if-visible'
import MyListItem from './list-item' 

const ESTIMATED_ITEM_HEIGHT = 200

export const MyItemList = (items) => (
  <div className="my-list">
    {items.map(item => (
      <RenderIfVisible defaultHeight={ESTIMATED_ITEM_HEIGHT}>
        <MyListItem item={item} />
      </RenderIfVisible>
    ))}
  </div>
)
```

## Props

- `defaultHeight?: number` __Default: 300__ - An estimate of the element's height.
- `visibleOffset?: number` __Default: 1000__ - How far outside the viewport in pixels should elements be considered visible?
- `root?: HTMLElement` __Default: null__ - [Root element](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#intersection_observer_concepts_and_usage) passed to `IntersectionObserver`.
- `children: React.ReactNode` - The component(s)/element(s) for which to defer rendering.