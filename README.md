# avalonbox

> A simple lightbox solution in vanilla JS.

## Install

Install the package
```
npm install https://github.com/Nafta7/avalonbox
```

Get the CSS file from *dist* OR from the github [CDN](https://cdn.rawgit.com/Nafta7/avalonbox/master/dest/avalonbox.css) OR

Since the component was developed using Sass you could integrate with your code in case you are using Sass.

## Usage

```js
import avalonbox from 'avalonbox'
avalonbox.run('image-gallery')
```

## Examples

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

## Development

Clone the repository and move to the directory:
```bash
git clone https://github.com/Nafta7/avalonbox.git
cd avalonbox
```

Install the dependencies and run build:
```bash
npm install
npm build
```

Finally, run npm start:
```bash
npm start
```

## Third-party resources

(CC BY 3.0 US) [Navigation icons](https://thenounproject.com/fatahillah/collection/navigations-arrows-siji/)

## License

MIT.
