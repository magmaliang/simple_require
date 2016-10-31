define(["math"],function(__Math){
	var ipt = document.createElement("input");
	ipt.setAttribute("value",__Math.add(1,2));
	document.body.appendChild(ipt);
	
	console.log(__Math.add(1,2))
})