var delta = {
    ops: [
		{"attributes":{"size":"small"},"insert":"small"},
		{"insert":"\nnormal\n"},
		{"attributes":{"size":"large"},"insert":"large"},
		{"insert":"\n"},
		{"attributes":{"size":"huge"},"insert":"huge"},
		{"insert":"\n"},
		{"attributes":{"bold":true},"insert":"bold"},
		{"insert":"\n"},
		{"attributes":{"italic":true},"insert":"italics"},
		{"insert":"\n"},
		{"attributes":{"underline":true},"insert":"underline"},
		{"insert":"\n"},
		{"attributes":{"strike":true},"insert":"strikeout"},
		{"insert":"\n"},
		{"attributes":{"background":"yellow"},"insert":"highlight"},
		{"insert":"\n"},
		{"attributes":{"code":true},"insert":"monospace"},
		{"insert":"\nbullet"},
		{"attributes":{"list":"bullet"},"insert":"\n"},
		{"insert":"bullet"},
		{"attributes":{"indent":1,"list":"bullet"},"insert":"\n"},
		{"insert":"bullet"},
		{"attributes":{"list":"bullet"},"insert":"\n"},
		{"attributes":{"bold":true},"insert":"bold bullet"},
		{"attributes":{"list":"bullet"},"insert":"\n"},
		{"attributes":{"underline":true,"bold":true},"insert":"bold and underlined"},
		{"insert":"\n"},
		{"attributes":{"link":"https://link.com"},"insert":"a link"},
		{"insert":"\n"}
	]
};

var d = new denote(delta);
var parsed = d.parse();
console.log(parsed.toNote());
