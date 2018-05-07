# denote.js
Render [Quill](https://github.com/quilljs/quill/) Deltas to [Tomboy](https://wiki.gnome.org/Apps/Tomboy) Note XML

## Use
Include `denote.js` in your web page:
```html
<script src="./js/denote.js"></script>
```
Create a new instance of the `denote` class and give it an `object` or `string` to parse to Tomboy Note format as `delta`  
```js
var dd = new denote(delta);
var parsed = dd.parse();
var data = parsed.toNote();
```
Then do what you will with the `data`.  
Note: the toolbar options for Quill in the example folder are the only options that denote.js will render.

## Example
```js
// Evoke Quill after including it in your html, etc.
var Delta = Quill.import('delta');
var quill = new Quill('#editor-container', {
  modules: {
	toolbar: [
	  [{ size: [ 'small', false, 'large', 'huge' ]}],
	  ['bold', 'italic', 'underline', 'strike'],
	  [{ 'background':'yellow' }, 'code'],
	  ['clean'],
	  [{ 'list': 'bullet' }]
      ]
  },
  placeholder: 'Compose an epic...',
  theme: 'snow'
});
// Populate a hidden input area on form submit
var form = document.querySelector('form');
form.onsubmit = function() {
	// denote.js
	var delta = quill.getContents();
	var dd = new denote(delta);
	var parsed = dd.parse();
	var data = parsed.toNote();
	// Populate hidden form on submit
	var note = document.querySelector('input[name=note]');
	note.value = data;
};
```
### Gratitude
This project was inspired by [Deltoid.js](https://github.com/na2axl/Deltoid.js)
