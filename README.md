# denote.js
Render Quilljs Deltas to Tomboy Note XML

## Use

Include `denote.js` in your web page:
```html
<script src="./js/denote.js"></script>
```
Create a new instance of the `denote` class and give it an `object` or a `string` to parse as `delta`:

## Example
```js
var delta = {
    ops: [
        {
            insert: "Hello ",
            attributes: {
                bold: true,
                underline: true
            }
        },
        {
            insert: "world!",
            attributes: {
                italic: true
            }
        }
    ]
};
var d = new denote(delta);
var parsed = d.parse();
parsed.toXML(); // => <underline><bold>Hello </bold></underline><italic>world!</italic>
```
