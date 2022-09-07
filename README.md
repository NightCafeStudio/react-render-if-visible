# React RenderIfVisible
Harness the power of Intersection Observers for simple list virtualization in React.

This tiny React component is a drop-in list virtualization alternative that defers rendering of its children until it is on or near the screen. Unlike other virtualization libraries, it takes about one minute to integrate and doesn't require you to change your code other than wrapping each item in `<RenderIfVisible></RenderIfVisible>`.

It works equally well with responsive item heights, responsive grids, non-flat lists, and any other HTML that would normally make other virtualization libraries complicated to implement.

Advantages over other virtualization techniques:

- No need for a flat list
- Works with any DOM nesting structure
- Is completely decoupled from infinite-scroll or pagination
- Works for responsive grids with no extra configuration
- Easy to drop in - just wrap your list items with `<RenderIfVisible></RenderIfVisible>`
- Doesn't require a wrapper around your entire list and doesn't care if other elements are interspersed with the list items
- Doesn't care how scrolling works for your situation (i.e. is it window scroll, or scrolling within a div with `overflow: scroll`)
- It is tiny - __~100 lines__ - and has no dependencies (apart from React as a peer dependency).

This solution has been used successfully in production on [NightCafe Creator](https://creator.nightcafe.studio) for almost 2 years.

Read more about the background and development of this component on [dev.to](https://dev.to/angus_russell/super-simple-list-virtualization-in-react-with-intersectionobserver-3o6g).

## Version 2

### Potentially breaking change - SSR

In v1.x, the component detected when it was being rendered on the server, and set the initial visible state to true. To work with server-side rendering in React 17+, we no-longer detect the server from within the component, but a new prop `initialVisible` is exposed which allows you to control whether the child component should be visible on first render or not. This is intended to be used for things like always rendering the first N components as visible, and the rest as not visible (until they're scrolled into view).

### Other changes in v2

- Works with React 17 and 18
- A new prop - `stayRendered` (thanks to [cyremur](https://github.com/cyremur)) that will keep the element visible after it's been rendered for the first time
- New props allow you to specify the type of root and placeholder elements (in versions 1.x they were always divs), which allows you to use this package inside tables, etc

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
- `visibleOffset?: number` __Default: 1000__ - How far outside the viewport (or `root` element) in pixels should elements be considered visible?
- `stayRendered?: boolean` __Default: false__ - Should the element stay rendered after it becomes visible?
- `root?: HTMLElement` __Default: null__ - [Root element](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#intersection_observer_concepts_and_usage) passed to `IntersectionObserver`.
- `rootElement?: HTMLElement` __Default: "div"__ - This is the HTML element that will wrap around the children and placeholder. This root element is always present.
- `placeholderElement?: HTMLElement` __Default: "div"__ - This is the HTML element that will be used for the placeholder. This placeholder element is contained in the root element.
- `children: React.ReactNode` - The component(s)/element(s) for which to defer rendering.

## Example usage
When using HTML tables, you can change the default rootElement from "div" to "tbody". For example:
```javascript
import React from 'react'
import RenderIfVisible from 'react-render-if-visible'
import MyListItem from './list-item' 

const ESTIMATED_ITEM_HEIGHT = 200

export const MyItemList = (items) => (
  <table className="my-list">
    <colgroup>
      <col><col>
    </colgroup>
    {items.map(item => (
      <RenderIfVisible defaultHeight={ESTIMATED_ITEM_HEIGHT} rootElement={"tbody"} placeholderElement={"tr"}>
        <MyListItem item={item} />
      </RenderIfVisible>
    ))}
  </table>
)
```

The example above, builds a valid HTML table like the one shown below:
```
  <table class="my-list">
    <colgroup>
      <col><col>
    </colgroup>
    <tbody class="renderIfVisible">
      <tr><td>col1</td><td>col2</td></tr>
    </tbody>
    <tbody class="renderIfVisible">
      <tr><td>col1</td><td>col2</td></tr>
    </tbody>
    <tbody class="renderIfVisible">
      <tr><td>col1</td><td>col2</td></tr>
    </tbody>
    <tbody class="renderIfVisible">
      <tr><td>col1</td><td>col2</td></tr>
    </tbody>
    ... (offscreen)
    <tbody class="renderIfVisible">
      <tr class="renderIfVisible-placeholder" style="height:200px"></tr>
    </tbody>
    <tbody class="renderIfVisible">
      <tr class="renderIfVisible-placeholder" style="height:200px"></tr>
    </tbody>
    <tbody class="renderIfVisible">
      <tr class="renderIfVisible-placeholder" style="height:200px"></tr>
    </tbody>
  </table>
```
