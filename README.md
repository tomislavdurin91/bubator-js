# BubatorJS

A small and performant custom scrollbar solution written in pure JS which
doesn't require absolute or fixed positioning on it's wrappers.

## Features

* Lightweight (~6 kB minified, probably even less gzipped)
* Written in plain JS with no additional dependencies
* Efficient (uses rAF, mutationObserver and debouncing under the hood)
* Doesn't require absolute or fixed positioning on its parent wrappers unlike
other scrollbar solutions
* Automatically recalculates itself on resize and on content change
* Supports scroll to, scroll by and scroll to element
* Doesn't get called when on a mobile device in order to save resources

## Getting Started

If you are using a module bundler which supports ES6 imports (ie. webpack)
download `bubator-es6.min.js` from the dist folder and place it in your
project.

You can then include the plugin like this:

```javascript
import BubatorJS from 'path/to/bubator'
```

Otherwise, choose `bubator.min.js` and load it via a `<script>` tag placed
near the end of the `<body>` tag:

```html
    ...
    ...
    <script src='path/to/bubator.min.js'></script>
</body>
</html>
```

CSS is also required.

An `.scss` file is available in the dev folder for you
to include it in your build system in any way you like.

If, however, you are not using a build system then choose `bubator.min.css`
from the dist folder and load it via a `<style>` tag placed near the end of
the `<head>` tag like this:

```html
    ...
    ...
    <link href='path/to/bubator.min.css' rel='stylesheet'>
</head>
```

## Usage

The following minimal markup is required for the plugin to work properly:

```html
...
<div id="jsBubator1" class="your-custom-class">
    <div class="bubator-scrollview">
        <div class="bubator-content">

            Place your content here

        </div>
    </div>
    <div class="bubator-h-track">
        <div class="bubator-h-thumb"></div>
    </div>
    <div class="bubator-v-track">
        <div class="bubator-v-thumb"></div>
    </div>
</div>
...
```

IMPORTANT - In the example above:<br>

* `id` must be unique
* `your-custom-class` has to have a position other than `position:static`
* `bubator-scrollview` has to have a height other than `height:auto` or has
to have a `max-height`

After that you can instantiate the plugin by calling:

```javascript
var bubator = new BubatorJS('jsBubator1');
```

Note that the string passed into the plugin constructor MUST be the same as
the `id` on the plugin wrapper in the DOM.

## Documentation

The returned instance exposes the following methods:
<style>td { min-width: 160px; }</style>
| Name         | Params | Description |
|--------------|---------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| scrollVthumb | dest \<`Number` \| `String`\><br>scrollBy \<`Boolean`\> | Scrolls content vertically.<br>If the *dest* param is of type `Number` then the method acts like `element.scrollTo()`.<br>If the *scrollBy* param is also set to `true` then the method acts like `element.scrollBy()`.<br>If the *dest* param is of type `String` then the method acts like `element.scrollIntoView()`.<br>In this case the *scrollBy* param does not have any effect. |
| scrollHthumb | Same as above                                           | Same as above, but for horizontal scrollbar                                                                                                                                                                                                                                                                                                                                             |
| destroy      | None                                                    | Destroys the instance which called it and removes all instance associated event listeners and styling.                                                                                                                                                                                                                                                                                                                                                                                        |

<br>
Example calls:

```javascript
bubatorInstance.scrollVthumb(200);
bubatorInstance.scrollVthumb(300, true);
bubatorInstance.scrollVthumb('elem-class');

bubatorInstance.scrollHthumb(100);
bubatorInstance.scrollHthumb(400, true);
bubatorInstance.scrollHthumb('elem-class');

bubatorInstance.destroy();
```

A `destroyAll` method also exists on `BubatorJS` itself and it is used to
destroy all plugin instances and remove all event listeners.<br>
It can be invoked like this:

```javascript
BubatorJS.destroyAll();
```

## Examples

TODO

## Caveats

* It is currently not possible to simultaneously scroll in multiple directions
using a laptop touchpad
* It is currently not possible to programatically scroll both horizontally and
vertically at the same time
* Due to tricky markup required for supporting all browsers, spacing on the
left or right of the content can only be added by setting `padding-left` or
`padding-right` on the `bubator-content` class
* Due to tricky markup required for supporting all browsers, spacing on the
bottom of the content can only be added by setting a `border-bottom` on the
`bubator-content` class (or by normally setting a `margin\padding` on the
last element of your content as usual)

## License

[MIT](LICENSE.md)

## Acknowledgments

* [Das Surma](https://github.com/surma) for his [amazing article](https://developers.google.com/web/updates/2017/03/custom-scrollbar) on custom scrollbars which actually inspired me to develop this
* [Paul Lewis](https://github.com/paullewis) for his [amazing article](https://www.html5rocks.com/en/tutorials/speed/animations/) on requestAnimationFrame, throttling and debouncing
* Ian Elliot for his [fantastic book](https://iopress.info/index.php/books/just-javascript) which really helped me understand how JS works in depth
