var define,require;
require = function(options){
	let {entry,baseUrl} = options;
	//存放所有生成的模块
	var modules  = {},
		unLoadedModules = [];//每当有script_onload触发时，则shift一个模块，生成Module

	//根据id加载一个模块，数据结构如下
	function loadModule(id){
		var node = document.createElement('script');
        node.setAttribute('data-modid', id);
        node.src = baseUrl+id+".js";

    	node.addEventListener('load', function(e){
    		//当前脚本加载的模块名
    		var id = e.target.getAttribute("data-modid");
    		completeLoaded(id);

    		//对所有可以导出export的模块进行导出
    		tryLoading()
    	}, false);

    	document.head.appendChild(node);
	}

	/*   *   *   *   *   *   *   *   *   *   *
	 *  Module用于构建存放于modules中的模块实例    
	 *   *   *   *   *   *   *   *   *   *   */
	function Module(id,deps,factory){
		this.id = id;
		this.deps = deps;//["a","b"]
		this.factory = factory;
		this.loaded = false;
		this.export = null;
	}

	Module.prototype = {
		getExport:function(){
			//如果export不存在，则构建
			if (!this.export) {
				var _args = this.deps.map(item=>{
					return modules[item].export;
				})
				this.export = this.factory.apply(null,_args);
				this.loaded = true;
			}
			return this.export;
		}
	}

	//当一个远程脚本完成加载时,从unLoadedModules中左移出一个模块.
	//将此模块格式化成Module对象，存放于modules中
	function completeLoaded(id){
		if (unLoadedModules.length) {
			var mod = unLoadedModules.shift();
			mod[0] = id;

			modules[id] = new Module(mod[0],mod[1],mod[2]);

			//如果是无依赖模块，则立即得到它的export()
			if (mod[1].length == 0) {
				modules[id].getExport()
			}
		}	
	}

	//尝试对modules中依赖加载完成的模块生成export
	function tryLoading(){
		var _modsname = Object.keys(modules);

		_modsname.map(modname=>{
			var __Mod = modules[modname];

			var deps = __Mod.deps;
			var canExport = true;

			if (deps.length>0) {
				//检测是否所有依赖都已完成加载
				deps.map(depname=>{
					if (!modules[depname] || modules[depname].loaded == false) {
						canExport = false;
					}
				})
			}

			if (canExport && __Mod.loaded == false) {
				__Mod.getExport()
			}
			
		})
	}

	//两个参数都是必须的
	define = function(deps,factory){
		unLoadedModules.push([null,deps,factory]);
		if (deps.length>0) {
			deps.map(_mod=>{
				loadModule(_mod);
			})
		}
	}

	//从入口启动
	loadModule(entry)

	function waitForEntry(){
		if (modules[entry] && modules[entry].loaded == false) {
			tryLoading();
		}else{
			setTimeout(waitForEntry,50)
		}
	}

	waitForEntry()
}