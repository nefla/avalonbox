# avalonbox

> A simple lightbox solution in vanilla js.

# Install

```
npm install https://github.com/Nafta7/avalonbox
```

# Usage

```js
import avalonbox from 'avalonbox'
avalonbox.init('#image-gallery')
```

# CSS

## Option 1: CDN

For a quick start you can just grab the css file from the github cdn:
https://cdn.rawgit.com/Nafta7/avalonbox/master/dest/avalonbox.css

## Option 2: Integration with Sass

Avalonbox was built using Sass and its easy to integrate
with your Sass code. You can download the source files from
the repository or import directly from `node_modules`.

See.

Enter in your Sass directory:

```
cd path/to/sass
```

Create a `vendor` folder (in case you don't have yet)
inside this directory to hold any third-party Sass imports.

```
mkdir vendor
cd vendor
```

Now create a soft link for `avalonbox` styles from `node_modules`:

```
ln -s ../../node_modules/avalonbox/styles/ avalonbox
```

Then you can simply import the avalonbox Sass file
within your main Sass code:

`sass/main.scss`
```sass
@import 'vendor/avalonbox/avalonbox';
```

It's three/four steps but I think it's worth the hassle.

# Examples

HTML sample code:

```html
<div id="image-gallery" class="gallery">

  <a href="images/image_1.jpg">
    <img src="images/thumb_image_1.jpg" />
  </a>

  <a href="images/image_2.jpg">
    <img src="images/thumb_image_2.jpg" />
  </a>

  <a href="images/image_3.jpg">
    <img src="images/thumb_image_3.jpg" />
  </a>

</div>
```
# License

MIT.
