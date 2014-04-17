var 
	system = require('system'),
	webpage = require('webpage'),
	baseUrl = encodeURI(system.args[1]),
	
	// provide a string or a config object
	examples = [
	    "action/mappanel_with_actions.html",
	    "app/simple/simple.html",
	    {
	     	url: "geocoder/geocoder.html",
	     	fn: function(){ 
	     		var cb = Ext.ComponentQuery.query("gx_geocodercombo")[0];
	     		cb.doQuery('Bonn', true, true); 
	     		cb.expand();
	     		cb.onExpand();
	     		cb.select(cb.getStore().getAt(1));
	     	},
	    	clipRect: { top: 184, left:28, width: 490, height: 390 },
	    	wait: 2000
	    },
	    { 
	    	url: "grid/feature-grid.html",
	    	clipRect: { top: 220, left:20, width: 900, height: 400 }
	    },
	    {
	    	url: "layeropacityslider/layeropacityslider.html",
	    	clipRect: { top: 246, left:20, width: 400, height: 322 }
	    },
	    {
	    	url:"legendpanel/legendpanel.html",
	    	clipRect: { top: 136, left:20, width: 800, height: 400 }
	    },
	    "mappanel/mappanel.html",
	    { 
	    	url:"permalink/permalink.html",
	    	clipRect: { top: 550, left: 20, width: 118, height: 90}
	    },
	    {
	    	url: "popup/popup.html",
	    	fn: function(){
	    		var map = window.mapPanel.map;
	    		var feature = map.layers[2].features[0];
	    		map.zoomIn();
	    		map.controls[4].clickFeature(feature);
	    	},
	    	clipRect: { top: 286, left: 25, width: 590, height: 359},
	    	wait: 4000
	    },
	    {
	    	url: "printextent/print-extent.html",
	    	clipRect: { top: 179, left: 20, width: 450, height: 284 }
	    },
	    {
	    	url:"printform/print-form.html",
	    	clipRect: { top: 148, left: 20, width: 700, height: 420 }
	    },
	    {
	    	url: "printpage/print-page.html",
	    	clipRect: { top: 148, left: 20, width: 700, height: 410 }
	    },
	    {
	    	url: "printpreview/print-preview.html",
	    	fn: function(){
	    		var button = Ext.ComponentQuery.query('button[text="Print..."]')[0];
	    		button && button.fireHandler();
	    	},
	    	clipRect: {top: 148, left: 20, width: 795, height: 532 },
	    	wait: 10000
	    },
	    {
	    	url: "renderer/renderer.html",
	    	clipRect: {top: 208, left: 20, width: 274, height: 204 }
	    },
	    {
	    	url: "stylegrid/style-grid.html",
	    	clipRect: {top: 179, left: 20, width: 220, height: 200 }
	    },
	    "tree/tree-legend.html",
	    {
	    	url: "wfscapabilities/wfscapabilities.html",
	    	clipRect: {top: 148, left: 20, width: 650, height: 300 }
	    },
	    {
	    	url: "wmscapabilities/wmscapabilities.html",
	    	clipRect: {top: 148, left: 20, width: 650, height: 300 }
	    },
	    {
	    	url: "zoomchooser/zoomchooser.html",
	    	clipRect: {top: 148, left: 20, width: 600, height: 400 },
	    	fn: function(){
	    		var cb = Ext.ComponentQuery.query('combobox[emptyText="Zoom Level"]')[0];
	     		cb.expand();
	    	},
	    	wait: 8000
	    },
	    {
	    	url: "zoomslider/zoomslider.html",
	    	clipRect: {top: 164, left: 20, width: 400, height: 300 },
	    }
    ];
/**
 * Waits for ExtJS to be ready, then executes provided function
 *
 * @param fun function to execute
 */
var waitForExtReady = function(p, fun) {
    var me = this;
    console.log('Waiting for ExtJS to be ready...');
    var readyChecker = window.setInterval(function() {

        var isReady = p.evaluate(function() {
            return Ext && Ext.isReady;
        });

        if (isReady) {
            console.log('ExtJS is ready.');
            window.clearInterval(readyChecker);
            fun.call(me);
        }
    }, 2000);
};

var capture = function(exampleUrl, ii, cfg){
	
	var page = webpage.create(),
		pageUrl = baseUrl + exampleUrl,
		thumbUrl = exampleUrl.split("/").slice(0, exampleUrl.split("/").length - 1).join("/") + "/",
		image = 'thumb.png',
		timeForTiles = 16000,
		timeForFunction = cfg && cfg.wait || 1000,
		timeForExit = 2000,
		f = 8; // factor for viewport size
	
	console.log("thumbUrl:",thumbUrl);
	
	page.viewportSize = { width: 118 * f, height : 90 * f };
	
	page.open(pageUrl, function(){
		
		waitForExtReady(page, function() {
			window.setTimeout(function(){
				
				// hide theme switcher
				page.evaluate( function(){ Ext.get("options-toolbar").hide(); });
				
				// call optional function
				
				if (cfg && cfg.fn) page.evaluate( cfg.fn );
				
				// clip optionally
				if (cfg && cfg.clipRect) page.clipRect = cfg.clipRect;
				
				// the actual snapshot 
				window.setTimeout(function(){ page.render( thumbUrl + image ); }, timeForFunction + 1000); 
				
				// maybe end phantomjs
				if ( ii == examples.length - 1 ) 
	              window.setTimeout(phantom.exit, timeForFunction + timeForExit); 
				
			}, timeForTiles);
        });
		
	});
	
}

for (var i = 0; i < examples.length; i++) {
	
	var url = examples[i];
		
	
	if (url instanceof Object)
	{
		capture(url.url,i,{
			fn: url.fn || null,
			clipRect: url.clipRect || null
		});
	} 
	else 
	{ 
		capture(url,i);
	};
	
}