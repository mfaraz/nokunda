function savedwindow()
{ 
	var swindow = Ti.UI.createWindow(
		{ 
			title: 'Pending Reports', 
			backgroundColor: '#FFFFFF', 
			barColor: '#3498db',
			fullscreen: true,
			navBarHidden: true 
		});
	swindow.addEventListener('focus', listreports);
	
	var myTemplate = 
	{
	    childTemplates: 
	    [
	        {
	            type: 'Ti.UI.ImageView',  // Use an image view
	            bindId: 'photo',            // Bind ID for this image view
	            properties: 
	            {             // Sets the ImageView.image property
	            	image: 'KS_nav_ui.png',
	            	left: '6dp',
	            	height: '50dp',
	            	width: '45dp'
	            }
	            ,
	            events: { click : upload }  // Binds a callback to the button's click event
	        },
	        {
	            type: 'Ti.UI.Label',
	            bindId: 'rowtitle',
	            properties: 
	            {     
		            color: 'black',
					font: 
					{
						fontSize : 13,
						//fontWeight : 'bold',
						fontFamily : 'Helvetica Neue'//left: '10dp'
	            	}
	            }
	        },
	        {
	            type: 'Ti.UI.Button',
	            bindId: 'button',
	            properties:
	            {
	                width: '47dp',
	                height: '27dp',                        	
	                right: '6dp',
	                font: 
	                {
						fontSize : 10,
						//fontWeight : 'bold',
						fontFamily : 'Helvetica Neue'
					},
					title: 'Upload',
					backgroundColor: '#3498db',
					borderRadius : 4,
					color: '#FFFFFF'
	            },
	            events: { click : upload }  // Binds a callback to the button's click event
	        }
	    ]
	};

	function upload(e) 
	{
		Ti.API.info('Upload clicked: ' + e.type);
	    var item = e.section.getItemAt(e.itemIndex);
	    //alert('Report ID clicked: ' + item.id);
	    
	    var db = Ti.Database.open("mydb");
	    var data = db.execute('SELECT title, description, date, hour, minute, ampm, lat, longi, loc, pic FROM params WHERE id=?', item.id);
	    if (data.isValidRow()) 
	    {
		    var a = data.fieldByName("title");
			var b = data.fieldByName("description");
			var c = data.fieldByName("date");
			var d = data.fieldByName("hour");
			var e1 = data.fieldByName("minute");
			var f = data.fieldByName("ampm");
			var g = data.fieldByName("lat");
			var h = data.fieldByName("longi");
			var i = data.fieldByName("loc");
			var j = data.fieldByName("pic");
			var task_para = 'report';
    	}
    	db.close();
    	
    	var fpic = Ti.Filesystem.getFile(j);
		var photo = fpic.read();
    	
    	rclient = Titanium.Network.createHTTPClient();
		rclient.open("POST","http://nokunda.labandroid.com/api");
		rclient.setRequestHeader("Connection", "close");
		
		rclient.onload = function()
		{
		     var db = Ti.Database.open("mydb");
		     db.execute('DELETE FROM params WHERE id=?', item.id);
		     listreports();
		     alert("responseText: " + this.responseText);
		     response = JSON.parse(this.responseText);
		    
		    row = db.execute('SELECT count FROM counter');
		    var currcount = row.fieldByName("count");
		    currcount++;
			db.execute('UPDATE counter SET count=?', currcount);
			row.close();
			db.close();
		};
		
		rclient.onsendstream = function(e)
		{
		   //alert("Uploading. Check progress");
		   Ti.API.info('PROGRESS: ' + e.progress);
		};
		
		rclient.onerror = function(e) 
		{
			alert('Failed to Upload! :/');
		};
		
    	
    	
		var params = 
		{
			"task":"report",
			"incident_title": a,
			incident_description: b,
			incident_date: c,
			incident_hour: d,
			incident_minute: e1,
			incident_ampm: f,
			incident_category: '1',
			latitude:  g,
			longitude: h,
			location_name: i,
			//incident_photo:e.media
			"incident_photo[]" : photo
		};
		
		rclient.send(params);	     
	
	
	};
	
	var lview = Ti.UI.createListView(
	{
	   	separatorColor: '#447294',
	    templates: { 'myTemplate': myTemplate },         // Mapping myTemplate object to the 'myTemplate' style name
	    defaultItemTemplate: 'myTemplate',   			 // Making it default list template for all rows/dataitems
		backgroundColor: '#FFFFFF',
	 //   headerTitle: "Reports to Upload",     //causes dexer fail
	});
	
	
	function listreports()
	{
		var db = Ti.Database.open("mydb");
		var rows = db.execute('SELECT id, title, description, date, hour, minute, ampm, lat, longi, loc, pic FROM params');
		//var rows = db.execute('SELECT * FROM params');
		data = [];
		
		while ( rows.isValidRow() ) 
		{
			
			data.push(
			{
				id: rows.fieldByName('id'),
				photo: {image: rows.fieldByName('pic') },
				rowtitle: {text: rows.fieldByName("title").toString() },
				properties : 
				{
		            itemId: rows.fieldByName('id'),
		            accessoryType: Ti.UI.LIST_ACCESSORY_TYPE_NONE
        		}
			
			});
			
			rows.next(); 
		};
		rows.close();
		db.close(); 
		
		//after filling up data[], now displaying the list
		var section = Ti.UI.createListSection({items: data});
		lview.sections = [section];
		
		//list.setData(data);
		
		lview.addEventListener('itemclick', function(e)
		{
  
	    	if (e.bindId == 'button' || e.bindId == 'photo') 
	    	{
	        var item = e.section.getItemAt(e.itemIndex);
	        //alert('Report ID clicked: ' + item.id);
    		}      
		});
		swindow.add(lview); 
	}
	
	listreports();
	return swindow; 
};
module.exports = savedwindow;
