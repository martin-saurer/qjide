////////////////////////////////////////////////////////////////////////////////
// File:        Application.js
// Author:      Martin Saurer, 18.02.2016
// Description: Qooxdoo based J browser IDE.
//
// License:     GPL Version 3 (see gpl3.txt)
////////////////////////////////////////////////////////////////////////////////

/**
 * This is the main application class of your custom application "qjide"
 *
 * @asset(qjide/*)
 */
qx.Class.define("qjide.Application",
{
   extend : qx.application.Standalone,

   /////////////////////////////////////////////////////////////////////////////
   // Members
   /////////////////////////////////////////////////////////////////////////////
   members :
   {
      // This method contains the initial application code and gets called
      // during startup of the application
      //
      // @lint ignoreDeprecated(alert)
      main : function()
      {
         // Call super class
         this.base(arguments);

         // Enable logging in debug variant
         if(qx.core.Environment.get("qx.debug"))
         {
            // support native logging capabilities, e.g. Firebug for Firefox
            qx.log.appender.Native;

           // support additional cross-browser console. Press F7 to toggle visibility
           qx.log.appender.Console;
         }

         ///////////////////////////////////////////////////////////////////////
         // Below is your actual application code...
         ///////////////////////////////////////////////////////////////////////

         // JSON object
         var json = {};

         // Terminal output receiver timer started indicator
         var tor_timer_started = false;

         // Edit page array
         var edit_page_array = [];
         var edit_page_event = true;

         // Create font
         var edit_text_font = new qx.bom.Font(14,["courier new","courier","monospace"]);

         // Clipboard buffer
         var clipboard_buffer = "";

         // Timer manager
         var timer_manager = qx.util.TimerManager.getInstance();

         // Dialog visibility
         var qjide_message_box_visible = false;
         var qjide_yesno_box_visible   = false;
         var qjide_input_box_visible   = false;

         // Plot URL
         var plot_url = "";

         // Get root widget
         var root = this.getRoot();

         // Set theme
         qx.theme.manager.Meta.getInstance().setTheme(qx.theme.Modern);

         // Create root container
         var root_container = new qx.ui.container.Composite(new qx.ui.layout.Dock());

         //////////////////////////////////////////////////////////////////////////
         // Web Window Driver (wwd)
         //////////////////////////////////////////////////////////////////////////

         // WWD GUI info and data
         var wwd_gui_info = {};
         var wwd_gui_data = {};

         // WWD GUI flags
         var wwd_process_event = true;

         // Update gui info
         // This should be called in each event function which returns gui_info
         // TextFields and TextAreas are updated
         function wwd_update_gui_info()
         {
            for(var name in wwd_gui_data)
            {
               if(wwd_gui_data[name].type=="field")
               {
                  // Get value
                  var txt = wwd_gui_data[name].object.getValue();

                  // Set text
                  wwd_gui_info[name].text = txt;
               }
               else if(wwd_gui_data[name].type=="pass")
               {
                  // Get value
                  var txt = wwd_gui_data[name].object.getValue();

                  // Set text
                  wwd_gui_info[name].text = txt;
               }
               else if(wwd_gui_data[name].type=="area")
               {
                  // Get value
                  var txt = wwd_gui_data[name].object.getValue();

                  // Set text
                  wwd_gui_info[name].text = txt;
               }
               else if(wwd_gui_data[name].type=="check")
               {
                  // Get value
                  var val = wwd_gui_data[name].object.getValue();

                  // Set checked
                  if(val)
                  {
                     wwd_gui_info[name].checked = "true";
                  }
                  else
                  {
                     wwd_gui_info[name].checked = "false";
                  }
               }
               else if(wwd_gui_data[name].type=="radio")
               {
                  // Get value
                  var val = wwd_gui_data[name].object.getValue();

                  // Set checked
                  if(val)
                  {
                     wwd_gui_info[name].checked = "true";
                  }
                  else
                  {
                     wwd_gui_info[name].checked = "false";
                  }
               }
               else if(wwd_gui_data[name].type=="list")
               {
                  // Get value
                  var sel = wwd_gui_data[name].object.getSelection().getItem(0);

                  // If the selection value is longer than 1, everything works.
                  // If the selection value is exactly one character long, sel
                  // contains an object instead of the value ???
                  // An alert(sel) reports the correct value !!!
                  // I'm getting crazy !!!
                  // Don't know whether this is a bug in JavaScript, Qooxdoo or
                  // what the hell ever ...
                  // Fortunately, there is an easy workaround/solution
                  sel = "" + sel;

                  // Set selected
                  wwd_gui_info[name].selected = sel;
               }
               else if(wwd_gui_data[name].type=="select")
               {
                  // Check for undefined
                  if(wwd_gui_data[name].object.getSelection()[0]!=undefined)
                  {
                     // Get value
                     var sel = wwd_gui_data[name].object.getSelection()[0].getLabel();

                     // Ensure sel is a string (see also list)
                     sel = "" + sel;

                     // Set selected
                     wwd_gui_info[name].selected = sel;
                  }
                  else
                  {
                     // Set selected
                     wwd_gui_info[name].selected = "";
                  }
               }
               else if(wwd_gui_data[name].type=="combo")
               {
                  // Get value
                  var val = wwd_gui_data[name].object.getValue();

                  // Set selected
                  wwd_gui_info[name].text = val;
               }
               else if(wwd_gui_data[name].type=="table")
               {
                  // Get selected record
                  var rec = wwd_gui_data[name].model.getData()[wwd_gui_data[name].object.getFocusedRow()];

                  // Set selected
                  wwd_gui_info[name].selected = rec;
               }
               else if(wwd_gui_data[name].type=="tree")
               {
                  // Get selected tree node
                  var nod = wwd_gui_data[name].object.getSelection()[0];
                  var pth = "";

                  // Check node
                  if(nod!=undefined)
                  {
                     // Treewalk upwards until root is reached
                     pth = "/" + nod.getLabel();
                     while(true)
                     {
                        if(nod.get("parent")!=undefined)
                        {
                           nod = nod.get("parent");
                           pth = "/" + nod.getLabel() + pth;
                        }
                        else
                        {
                           break;
                        }
                     }
                  }

                  // Set selected
                  wwd_gui_info[name].selected = pth;
               }
               else if(wwd_gui_data[name].type=="date")
               {
                  // Get selected record
                  var dat = wwd_gui_data[name].object.getValue();

                  // Set selected
                  wwd_gui_info[name].date = [dat.getYear()+1900,dat.getMonth()+1,dat.getDate()];
               }
               else if(wwd_gui_data[name].type=="datfie")
               {
                  // Get selected record
                  var dat = wwd_gui_data[name].object.getValue();

                  // Set selected
                  wwd_gui_info[name].date = [dat.getYear()+1900,dat.getMonth()+1,dat.getDate()];
               }
               else if(wwd_gui_data[name].type=="tabs")
               {
                  // Get selected page
                  var tex = wwd_gui_data[name].object.getSelection()[0].getLabel();

                  // Set selected
                  wwd_gui_info[name].selected = tex;
               }
               else
               {
                  // We don't get data from other widgets
               }
            }
         }

         // WWD event handler
         function wwd_event_handler(name,evnt)
         {
            //alert("Execute event function: " + name + "_" + evnt + "\'\'");

            // Check wwd_process_event
            if(wwd_process_event)
            {
               // Disable further event processing, to prevent event overflow
               wwd_process_event = false;

               // Update GUI info
               wwd_update_gui_info();

               // Send event to server
               json = server_send(
               {
                  head:{fcode:"wwd",scode:"event"},
                  data:[JSON.stringify(wwd_gui_info),name+"_"+evnt]
               });

               // Receive terminal output
               receive_terminal_output();
            }
         }

         // Execute WWD GUI commands
         function wwd_exec(cmd)
         {
            // Parse JSON string in cmd
            var arr = JSON.parse(cmd);

            // Loop over array
            for(var i=0;i<arr.length;i++)
            {
               // Each array contains two arrays
               // Array1 = Commands
               // Array2 = Data
               var cmds = arr[i][0];
               var data = arr[i][1];

               // Alert
               //alert("qjide.wwd.exec: " + "cmds=" + cmds + ", data=" + data);

               // Main command
               if(cmds[0].toLowerCase()=="reset") //////////////////////////////
               {
                  // Loop over gui data
                  for(var nam in wwd_gui_data)
                  {
                     // Stop timers
                     if(wwd_gui_data[nam].type=="timer")
                     {
                        wwd_gui_data[nam].object.stop();
                     }

                     // Close windows
                     if(wwd_gui_data[nam].type=="window")
                     {
                        wwd_gui_data[nam].object.close();
                     }

                     // Destroy the stuff
                     try
                     {
                        wwd_gui_data[nam].object.destroy();
                     }
                     catch(e)
                     {
                     }
                  }

                  // WWD GUI info and data
                  wwd_gui_info = {};
                  wwd_gui_data = {};

                  // WWD GUI flags
                  wwd_process_event = true;
               }
               else if(cmds[0].toLowerCase()=="delete") ////////////////////////
               {
                  // Widget name
                  var name = cmds[1];

                  // Destroy qooxdoo object
                  try
                  {
                     wwd_gui_data[name].object.destroy();
                  }
                  catch(e)
                  {
                  }

                  // Deletee property from wwd_gui_data
                  try
                  {
                     delete wwd_gui_data[name];
                  }
                  catch(e)
                  {
                  }

                  // Deletee property from wwd_gui_info
                  try
                  {
                     delete wwd_gui_info[name];
                  }
                  catch(e)
                  {
                  }
               }
               else if(cmds[0].toLowerCase()=="create") ////////////////////////
               {
                  // Widget type
                  if(cmds[1].toLowerCase()=="window")
                  {
                     // Widget name
                     var name = cmds[2];
                     var wid  = data[0];
                     var hei  = data[1];
                     var cap  = data[2];

                     // Save info
                     wwd_gui_info[name]           = {};
                     wwd_gui_info[name].type      = "window";
                     wwd_gui_info[name].name      = name;
                     wwd_gui_info[name].parent    = "";
                     wwd_gui_info[name].caption   = cap;
                     wwd_gui_info[name].width     = wid;
                     wwd_gui_info[name].height    = hei;
                     wwd_gui_info[name].status    = "false";
                     wwd_gui_info[name].text      = "";
                     wwd_gui_info[name].visible   = "false";
                     wwd_gui_info[name].modal     = "false";
                     wwd_gui_info[name].resizable = "true";
                     wwd_gui_info[name].minimize  = "true";
                     wwd_gui_info[name].maximize  = "true";
                     wwd_gui_info[name].close     = "true";

                     // Save type
                     wwd_gui_data[name]        = {};
                     wwd_gui_data[name].type   = "window";
                     wwd_gui_data[name].name   = name;
                     wwd_gui_data[name].parent = "";

                     // Create it
                     wwd_gui_data[name].object = new qx.ui.window.Window(cap);

                     // Set width and height
                     wwd_gui_data[name].object.setWidth (wid);
                     wwd_gui_data[name].object.setHeight(hei);
                     wwd_gui_data[name].object.setContentPadding(0,0,0,0);

                     // Set layout
                     wwd_gui_data[name].object.setLayout(new qx.ui.layout.Grow());

                     // Add this window to root window
                     root.add(wwd_gui_data[name].object);

                     // Center window
                     wwd_gui_data[name].object.addListener("resize",wwd_gui_data[name].object.center,wwd_gui_data[name].object);

                     // Add event handler
                     wwd_gui_data[name].object.addListener("appear",function(e)
                     {
                        wwd_event_handler(this[0],this[1]);
                     },[name,"appear"]);
                  }
                  else if(cmds[1].toLowerCase()=="splitter")
                  {
                     // Widget name
                     var name = cmds[2];
                     var par  = cmds[3];
                     var xpos = data[0];
                     var ypos = data[1];
                     var wid  = data[2];
                     var hei  = data[3];
                     var dir  = data[4];
                     var sp1  = data[5];
                     var sp2  = data[6];

                     // Save info
                     wwd_gui_info[name]             = {};
                     wwd_gui_info[name].type        = "splitter";
                     wwd_gui_info[name].name        = name;
                     wwd_gui_info[name].parent      = par;
                     wwd_gui_info[name].xpos        = xpos;
                     wwd_gui_info[name].ypos        = ypos;
                     wwd_gui_info[name].width       = wid;
                     wwd_gui_info[name].height      = hei;
                     wwd_gui_info[name].orientation = dir;
                     wwd_gui_info[name].size1       = sp1;
                     wwd_gui_info[name].size2       = sp2;

                     // Save type
                     wwd_gui_data[name]        = {};
                     wwd_gui_data[name].type   = "splitter";
                     wwd_gui_data[name].name   = name;
                     wwd_gui_data[name].parent = par;

                     // Create it
                     wwd_gui_data[name].object = new qx.ui.splitpane.Pane(dir);

                     // Add it to parent
                     wwd_gui_data[par].object.add(wwd_gui_data[name].object,{row:ypos,column:xpos,rowSpan:hei,colSpan:wid});

                     // Save info
                     wwd_gui_info[name+"1"]        = {};
                     wwd_gui_info[name+"1"].type   = "composite";
                     wwd_gui_info[name+"1"].name   = name + "1";
                     wwd_gui_info[name+"1"].parent = name;
                     wwd_gui_info[name+"1"].show   = "true";
                     wwd_gui_info[name+"2"]        = {};
                     wwd_gui_info[name+"2"].type   = "composite";
                     wwd_gui_info[name+"2"].name   = name + "2";
                     wwd_gui_info[name+"2"].parent = name;
                     wwd_gui_info[name+"2"].show   = "true";

                     // Save type
                     wwd_gui_data[name+"1"]        = {};
                     wwd_gui_data[name+"1"].type   = "composite";
                     wwd_gui_data[name+"1"].name   = name + "1";
                     wwd_gui_data[name+"1"].parent = name;
                     wwd_gui_data[name+"2"]        = {};
                     wwd_gui_data[name+"2"].type = "composite";
                     wwd_gui_data[name+"2"].name   = name + "2";
                     wwd_gui_data[name+"2"].parent = name;

                     // Add splitter panes
                     wwd_gui_data[name+"1"].object = new qx.ui.container.Composite(new qx.ui.layout.Grow());
                     wwd_gui_data[name+"2"].object = new qx.ui.container.Composite(new qx.ui.layout.Grow());

                     // Create scrollers for each composite
                     wwd_gui_data[name+"1"].scroller = new qx.ui.container.Scroll(wwd_gui_data[name+"1"].object);
                     wwd_gui_data[name+"2"].scroller = new qx.ui.container.Scroll(wwd_gui_data[name+"2"].object);

                     // Add scrollers / split areas sp1:sp2
                     wwd_gui_data[name].object.add(wwd_gui_data[name+"1"].scroller,sp1);
                     wwd_gui_data[name].object.add(wwd_gui_data[name+"2"].scroller,sp2);

                     // Add split areas sp1:sp2 (original code, without scrollers)
                     //wwd_gui_data[name].object.add(wwd_gui_data[name+"1"].object,sp1);
                     //wwd_gui_data[name].object.add(wwd_gui_data[name+"2"].object,sp2);
                  }
                  else if(cmds[1].toLowerCase()=="grid")
                  {
                     // Widget name
                     var name = cmds[2];
                     var par  = cmds[3];
                     var wid  = data[0];
                     var hei  = data[1];

                     // Save info
                     wwd_gui_info[name]        = {};
                     wwd_gui_info[name].type   = "grid";
                     wwd_gui_info[name].name   = name;
                     wwd_gui_info[name].parent = par;
                     wwd_gui_info[name].width  = wid;
                     wwd_gui_info[name].height = hei;

                     // Save type
                     wwd_gui_data[name]        = {};
                     wwd_gui_data[name].type   = "grid";
                     wwd_gui_data[name].name   = name;
                     wwd_gui_data[name].parent = par;

                     // Create it
                     wwd_gui_data[name].object = new qx.ui.layout.Grid(1,1);

                     // Set grid options
                     for(var z=0;z<wid;z++)
                     {
                        wwd_gui_data[name].object.setColumnFlex(z,1);
                        wwd_gui_data[name].object.setColumnAlign(z,"center","middle");
                     }
                     for(var z=0;z<hei;z++)
                     {
                        wwd_gui_data[name].object.setRowFlex(z,1);
                        wwd_gui_data[name].object.setRowAlign(z,"center","middle");
                     }

                     // Set parent layout
                     wwd_gui_data[par].object.setLayout(wwd_gui_data[name].object);

                     // Set parent options
                     wwd_gui_data[par].object.setAllowShrinkX(false);
                     wwd_gui_data[par].object.setAllowShrinkY(false);
                  }
                  else if(cmds[1].toLowerCase()=="label")
                  {
                     // Widget name
                     var name = cmds[2];
                     var par  = cmds[3];
                     var xpos = data[0];
                     var ypos = data[1];
                     var wid  = data[2];
                     var hei  = data[3];
                     var tex  = data[4];

                     // Save info
                     wwd_gui_info[name]         = {};
                     wwd_gui_info[name].type    = "label";
                     wwd_gui_info[name].name    = name;
                     wwd_gui_info[name].parent  = par;
                     wwd_gui_info[name].xpos    = xpos;
                     wwd_gui_info[name].ypos    = ypos;
                     wwd_gui_info[name].width   = wid;
                     wwd_gui_info[name].height  = hei;
                     wwd_gui_info[name].text    = tex;
                     wwd_gui_info[name].bgcolor = "";
                     wwd_gui_info[name].fgcolor = "";

                     // Save type
                     wwd_gui_data[name]        = {};
                     wwd_gui_data[name].type   = "label";
                     wwd_gui_data[name].name   = name;
                     wwd_gui_data[name].parent = par;

                     // Create it
                     wwd_gui_data[name].object = new qx.ui.basic.Label(tex);

                     // Add it to parent
                     wwd_gui_data[par].object.add(wwd_gui_data[name].object,{row:ypos,column:xpos,rowSpan:hei,colSpan:wid});
                  }
                  else if(cmds[1].toLowerCase()=="image")
                  {
                     // Widget name
                     var name = cmds[2];
                     var par  = cmds[3];
                     var xpos = data[0];
                     var ypos = data[1];
                     var wid  = data[2];
                     var hei  = data[3];
                     var img  = data[4];

                     // Save info
                     wwd_gui_info[name]        = {};
                     wwd_gui_info[name].type   = "image";
                     wwd_gui_info[name].name   = name;
                     wwd_gui_info[name].parent = par;
                     wwd_gui_info[name].xpos   = xpos;
                     wwd_gui_info[name].ypos   = ypos;
                     wwd_gui_info[name].width  = wid;
                     wwd_gui_info[name].height = hei;
                     wwd_gui_info[name].image  = img;

                     // Save type
                     wwd_gui_data[name]        = {};
                     wwd_gui_data[name].type   = "image";
                     wwd_gui_data[name].name   = name;
                     wwd_gui_data[name].parent = par;

                     // Create it
                     wwd_gui_data[name].object = new qx.ui.basic.Image(img);

                     // Add it to parent
                     wwd_gui_data[par].object.add(wwd_gui_data[name].object,{row:ypos,column:xpos,rowSpan:hei,colSpan:wid});
                  }
                  else if(cmds[1].toLowerCase()=="button")
                  {
                     // Widget name
                     var name = cmds[2];
                     var par  = cmds[3];
                     var xpos = data[0];
                     var ypos = data[1];
                     var wid  = data[2];
                     var hei  = data[3];
                     var tex  = data[4];
                     var ico  = data[5];

                     // Save info
                     wwd_gui_info[name]        = {};
                     wwd_gui_info[name].type   = "button";
                     wwd_gui_info[name].name   = name;
                     wwd_gui_info[name].parent = par;
                     wwd_gui_info[name].xpos   = xpos;
                     wwd_gui_info[name].ypos   = ypos;
                     wwd_gui_info[name].width  = wid;
                     wwd_gui_info[name].height = hei;
                     wwd_gui_info[name].text   = tex;
                     wwd_gui_info[name].icon   = ico;

                     // Save type
                     wwd_gui_data[name]        = {};
                     wwd_gui_data[name].type   = "button";
                     wwd_gui_data[name].name   = name;
                     wwd_gui_data[name].parent = par;

                     // Create it
                     wwd_gui_data[name].object = new qx.ui.form.Button(tex,ico);

                     // Add it to parent
                     wwd_gui_data[par].object.add(wwd_gui_data[name].object,{row:ypos,column:xpos,rowSpan:hei,colSpan:wid});

                     // Add event handler
                     wwd_gui_data[name].object.addListener("execute",function(e)
                     {
                        wwd_event_handler(this[0],this[1]);
                     },[name,"execute"]);
                  }
                  else if(cmds[1].toLowerCase()=="field")
                  {
                     // Widget name
                     var name = cmds[2];
                     var par  = cmds[3];
                     var xpos = data[0];
                     var ypos = data[1];
                     var wid  = data[2];
                     var hei  = data[3];
                     var tex  = data[4];

                     // Save info
                     wwd_gui_info[name]          = {};
                     wwd_gui_info[name].type     = "field";
                     wwd_gui_info[name].name     = name;
                     wwd_gui_info[name].parent   = par;
                     wwd_gui_info[name].xpos     = xpos;
                     wwd_gui_info[name].ypos     = ypos;
                     wwd_gui_info[name].width    = wid;
                     wwd_gui_info[name].height   = hei;
                     wwd_gui_info[name].text     = tex;
                     wwd_gui_info[name].readonly = "false";
                     wwd_gui_info[name].bgcolor  = "";
                     wwd_gui_info[name].fgcolor  = "";

                     // Save type
                     wwd_gui_data[name]        = {};
                     wwd_gui_data[name].type   = "field";
                     wwd_gui_data[name].name   = name;
                     wwd_gui_data[name].parent = par;

                     // Create it
                     wwd_gui_data[name].object = new qx.ui.form.TextField(tex);

                     // Add it to parent
                     wwd_gui_data[par].object.add(wwd_gui_data[name].object,{row:ypos,column:xpos,rowSpan:hei,colSpan:wid});
                  }
                  else if(cmds[1].toLowerCase()=="pass")
                  {
                     // Widget name
                     var name = cmds[2];
                     var par  = cmds[3];
                     var xpos = data[0];
                     var ypos = data[1];
                     var wid  = data[2];
                     var hei  = data[3];
                     var tex  = data[4];

                     // Save info
                     wwd_gui_info[name]          = {};
                     wwd_gui_info[name].type     = "pass";
                     wwd_gui_info[name].name     = name;
                     wwd_gui_info[name].parent   = par;
                     wwd_gui_info[name].xpos     = xpos;
                     wwd_gui_info[name].ypos     = ypos;
                     wwd_gui_info[name].width    = wid;
                     wwd_gui_info[name].height   = hei;
                     wwd_gui_info[name].text     = tex;
                     wwd_gui_info[name].readonly = "false";
                     wwd_gui_info[name].bgcolor  = "";
                     wwd_gui_info[name].fgcolor  = "";

                     // Save type
                     wwd_gui_data[name]        = {};
                     wwd_gui_data[name].type   = "pass";
                     wwd_gui_data[name].name   = name;
                     wwd_gui_data[name].parent = par;

                     // Create it
                     wwd_gui_data[name].object = new qx.ui.form.PasswordField(tex);

                     // Add it to parent
                     wwd_gui_data[par].object.add(wwd_gui_data[name].object,{row:ypos,column:xpos,rowSpan:hei,colSpan:wid});
                  }
                  else if(cmds[1].toLowerCase()=="area")
                  {
                     // Widget name
                     var name = cmds[2];
                     var par  = cmds[3];
                     var xpos = data[0];
                     var ypos = data[1];
                     var wid  = data[2];
                     var hei  = data[3];
                     var tex  = data[4];

                     // Save info
                     wwd_gui_info[name]          = {};
                     wwd_gui_info[name].type     = "area";
                     wwd_gui_info[name].name     = name;
                     wwd_gui_info[name].parent   = par;
                     wwd_gui_info[name].xpos     = xpos;
                     wwd_gui_info[name].ypos     = ypos;
                     wwd_gui_info[name].width    = wid;
                     wwd_gui_info[name].height   = hei;
                     wwd_gui_info[name].text     = tex;
                     wwd_gui_info[name].readonly = "false";
                     wwd_gui_info[name].bgcolor  = "";
                     wwd_gui_info[name].fgcolor  = "";

                     // Save type
                     wwd_gui_data[name]        = {};
                     wwd_gui_data[name].type   = "area";
                     wwd_gui_data[name].name   = name;
                     wwd_gui_data[name].parent = par;

                     // Create it
                     wwd_gui_data[name].object = new qx.ui.form.TextArea(tex);

                     // Add it to parent
                     wwd_gui_data[par].object.add(wwd_gui_data[name].object,{row:ypos,column:xpos,rowSpan:hei,colSpan:wid});
                  }
                  else if(cmds[1].toLowerCase()=="check")
                  {
                     // Widget name
                     var name = cmds[2];
                     var par  = cmds[3];
                     var xpos = data[0];
                     var ypos = data[1];
                     var wid  = data[2];
                     var hei  = data[3];
                     var tex  = data[4];

                     // Save info
                     wwd_gui_info[name]         = {};
                     wwd_gui_info[name].type    = "check";
                     wwd_gui_info[name].name    = name;
                     wwd_gui_info[name].parent  = par;
                     wwd_gui_info[name].xpos    = xpos;
                     wwd_gui_info[name].ypos    = ypos;
                     wwd_gui_info[name].width   = wid;
                     wwd_gui_info[name].height  = hei;
                     wwd_gui_info[name].text    = tex;
                     wwd_gui_info[name].checked = "false";

                     // Save type
                     wwd_gui_data[name]        = {};
                     wwd_gui_data[name].type   = "check";
                     wwd_gui_data[name].name   = name;
                     wwd_gui_data[name].parent = par;

                     // Create it
                     wwd_gui_data[name].object = new qx.ui.form.CheckBox(tex);

                     // Add it to parent
                     wwd_gui_data[par].object.add(wwd_gui_data[name].object,{row:ypos,column:xpos,rowSpan:hei,colSpan:wid});

                     // Add event handler
                     wwd_gui_data[name].object.addListener("execute",function(e)
                     {
                        wwd_event_handler(this[0],this[1]);
                     },[name,"execute"]);
                  }
                  else if(cmds[1].toLowerCase()=="radbox")
                  {
                     // Widget name
                     var name = cmds[2];
                     var par  = cmds[3];
                     var xpos = data[0];
                     var ypos = data[1];
                     var wid  = data[2];
                     var hei  = data[3];

                     // Save info
                     wwd_gui_info[name]         = {};
                     wwd_gui_info[name].type    = "radbox";
                     wwd_gui_info[name].name    = name;
                     wwd_gui_info[name].parent  = par;
                     wwd_gui_info[name].xpos    = xpos;
                     wwd_gui_info[name].ypos    = ypos;
                     wwd_gui_info[name].width   = wid;
                     wwd_gui_info[name].height  = hei;

                     // Save type
                     wwd_gui_data[name]        = {};
                     wwd_gui_data[name].type   = "radbox";
                     wwd_gui_data[name].name   = name;
                     wwd_gui_data[name].parent = par;

                     // Create it
                     wwd_gui_data[name].object = new qx.ui.form.RadioButtonGroup();

                     // Add it to parent
                     wwd_gui_data[par].object.add(wwd_gui_data[name].object,{row:ypos,column:xpos,rowSpan:hei,colSpan:wid});
                  }
                  else if(cmds[1].toLowerCase()=="radio")
                  {
                     // Widget name
                     var name = cmds[2];
                     var par  = cmds[3];
                     var xpos = data[0];
                     var ypos = data[1];
                     var wid  = data[2];
                     var hei  = data[3];
                     var tex  = data[4];

                     // Save info
                     wwd_gui_info[name]         = {};
                     wwd_gui_info[name].type    = "radio";
                     wwd_gui_info[name].name    = name;
                     wwd_gui_info[name].parent  = par;
                     wwd_gui_info[name].xpos    = xpos;
                     wwd_gui_info[name].ypos    = ypos;
                     wwd_gui_info[name].width   = wid;
                     wwd_gui_info[name].height  = hei;
                     wwd_gui_info[name].text    = tex;
                     wwd_gui_info[name].checked = "false";

                     // Save type
                     wwd_gui_data[name]        = {};
                     wwd_gui_data[name].type   = "radio";
                     wwd_gui_data[name].name   = name;
                     wwd_gui_data[name].parent = par;

                     // Create it
                     wwd_gui_data[name].object = new qx.ui.form.RadioButton(tex);

                     // Add it to parent
                     wwd_gui_data[par].object.add(wwd_gui_data[name].object,{row:ypos,column:xpos,rowSpan:hei,colSpan:wid});

                     // Add event handler
                     wwd_gui_data[name].object.addListener("execute",function(e)
                     {
                        wwd_event_handler(this[0],this[1]);
                     },[name,"execute"]);
                  }
                  else if(cmds[1].toLowerCase()=="spacer")
                  {
                     // Widget name
                     var name = cmds[2];
                     var par  = cmds[3];
                     var xpos = data[0];
                     var ypos = data[1];
                     var wid  = data[2];
                     var hei  = data[3];
                     var widp = data[4];
                     var heip = data[5];

                     // Save info
                     wwd_gui_info[name]         = {};
                     wwd_gui_info[name].type    = "spacer";
                     wwd_gui_info[name].name    = name;
                     wwd_gui_info[name].parent  = par;
                     wwd_gui_info[name].xpos    = xpos;
                     wwd_gui_info[name].ypos    = ypos;
                     wwd_gui_info[name].width   = wid;
                     wwd_gui_info[name].height  = hei;
                     wwd_gui_info[name].widthp  = widp;
                     wwd_gui_info[name].heightp = heip;

                     // Save type
                     wwd_gui_data[name]        = {};
                     wwd_gui_data[name].type   = "spacer";
                     wwd_gui_data[name].name   = name;
                     wwd_gui_data[name].parent = par;

                     // Create it
                     wwd_gui_data[name].object = new qx.ui.core.Spacer(widp,heip);

                     // Add it to parent
                     wwd_gui_data[par].object.add(wwd_gui_data[name].object,{row:ypos,column:xpos,rowSpan:hei,colSpan:wid});
                  }
                  else if(cmds[1].toLowerCase()=="list")
                  {
                     // Widget name
                     var name = cmds[2];
                     var par  = cmds[3];
                     var xpos = data[0];
                     var ypos = data[1];
                     var wid  = data[2];
                     var hei  = data[3];
                     var dat  = data[4][0];
                     var idx  = data[5];

                     // Save info
                     wwd_gui_info[name]          = {};
                     wwd_gui_info[name].type     = "list";
                     wwd_gui_info[name].name     = name;
                     wwd_gui_info[name].parent   = par;
                     wwd_gui_info[name].xpos     = xpos;
                     wwd_gui_info[name].ypos     = ypos;
                     wwd_gui_info[name].width    = wid;
                     wwd_gui_info[name].height   = hei;
                     wwd_gui_info[name].data     = dat;
                     wwd_gui_info[name].selected = dat[idx];

                     // Save type
                     wwd_gui_data[name]        = {};
                     wwd_gui_data[name].type   = "list";
                     wwd_gui_data[name].name   = name;
                     wwd_gui_data[name].parent = par;

                     // Create model
                     wwd_gui_data[name].model = qx.data.marshal.Json.createModel(dat);

                     // Create list
                     wwd_gui_data[name].object = new qx.ui.list.List(wwd_gui_data[name].model);

                     // Add it to parent
                     wwd_gui_data[par].object.add(wwd_gui_data[name].object,{row:ypos,column:xpos,rowSpan:hei,colSpan:wid});

                     // Select first item
                     wwd_gui_data[name].object.getSelection().push(wwd_gui_data[name].model.getItem(idx));

                     // Add event handler
                     wwd_gui_data[name].object.getSelection().addListener("change",function(e)
                     {
                        wwd_event_handler(this[0],this[1]);
                     },[name,"change"]);
                  }
                  else if(cmds[1].toLowerCase()=="select")
                  {
                     // Widget name
                     var name = cmds[2];
                     var par  = cmds[3];
                     var xpos = data[0];
                     var ypos = data[1];
                     var wid  = data[2];
                     var hei  = data[3];
                     var dat  = data[4][0];

                     // Save info
                     wwd_gui_info[name]          = {};
                     wwd_gui_info[name].type     = "select";
                     wwd_gui_info[name].name     = name;
                     wwd_gui_info[name].parent   = par;
                     wwd_gui_info[name].xpos     = xpos;
                     wwd_gui_info[name].ypos     = ypos;
                     wwd_gui_info[name].width    = wid;
                     wwd_gui_info[name].height   = hei;
                     wwd_gui_info[name].data     = dat;
                     wwd_gui_info[name].selected = dat[0];

                     // Save type
                     wwd_gui_data[name]        = {};
                     wwd_gui_data[name].type   = "select";
                     wwd_gui_data[name].name   = name;
                     wwd_gui_data[name].parent = par;

                     // Create combo (select) box
                     wwd_gui_data[name].object = new qx.ui.form.SelectBox();

                     // Add it to parent
                     wwd_gui_data[par].object.add(wwd_gui_data[name].object,{row:ypos,column:xpos,rowSpan:hei,colSpan:wid});

                     // Add data
                     for(var z=0;z<dat.length;z++)
                     {
                        wwd_gui_data[name].object.add(new qx.ui.form.ListItem(dat[z]));
                     }

                     // Add event handler
                     wwd_gui_data[name].object.addListener("changeSelection",function(e)
                     {
                        wwd_event_handler(this[0],this[1]);
                     },[name,"change"]);
                  }
                  else if(cmds[1].toLowerCase()=="combo")
                  {
                     // Widget name
                     var name = cmds[2];
                     var par  = cmds[3];
                     var xpos = data[0];
                     var ypos = data[1];
                     var wid  = data[2];
                     var hei  = data[3];
                     var val  = data[4];
                     var dat  = data[5][0];

                     // Save info
                     wwd_gui_info[name]          = {};
                     wwd_gui_info[name].type     = "combo";
                     wwd_gui_info[name].name     = name;
                     wwd_gui_info[name].parent   = par;
                     wwd_gui_info[name].xpos     = xpos;
                     wwd_gui_info[name].ypos     = ypos;
                     wwd_gui_info[name].width    = wid;
                     wwd_gui_info[name].height   = hei;
                     wwd_gui_info[name].text     = val;
                     wwd_gui_info[name].data     = dat;

                     // Save type
                     wwd_gui_data[name]        = {};
                     wwd_gui_data[name].type   = "combo";
                     wwd_gui_data[name].name   = name;
                     wwd_gui_data[name].parent = par;

                     // Create combo (select) box
                     wwd_gui_data[name].object = new qx.ui.form.ComboBox();

                     // Add it to parent
                     wwd_gui_data[par].object.add(wwd_gui_data[name].object,{row:ypos,column:xpos,rowSpan:hei,colSpan:wid});

                     // Add value
                     wwd_gui_data[name].object.setValue(val);

                     // Add data
                     for(var z=0;z<dat.length;z++)
                     {
                        wwd_gui_data[name].object.add(new qx.ui.form.ListItem(dat[z]));
                     }
                  }
                  else if(cmds[1].toLowerCase()=="table")
                  {
                     // Widget name
                     var name = cmds[2];
                     var par  = cmds[3];
                     var xpos = data[0];
                     var ypos = data[1];
                     var wid  = data[2];
                     var hei  = data[3];
                     var col  = data[4][0];
                     var cwi  = data[5][0];
                     var dat  = data[6][0];
                     var idx  = data[7];

                     // Save info
                     wwd_gui_info[name]          = {};
                     wwd_gui_info[name].type     = "table";
                     wwd_gui_info[name].name     = name;
                     wwd_gui_info[name].parent   = par;
                     wwd_gui_info[name].xpos     = xpos;
                     wwd_gui_info[name].ypos     = ypos;
                     wwd_gui_info[name].width    = wid;
                     wwd_gui_info[name].height   = hei;
                     wwd_gui_info[name].columns  = col;
                     wwd_gui_info[name].data     = dat;
                     wwd_gui_info[name].selected = dat[idx];

                     // Save type
                     wwd_gui_data[name]        = {};
                     wwd_gui_data[name].type   = "table";
                     wwd_gui_data[name].name   = name;
                     wwd_gui_data[name].parent = par;

                     // Create model
                     wwd_gui_data[name].model = new qx.ui.table.model.Simple();

                     // Set columns
                     wwd_gui_data[name].model.setColumns(col);

                     // Create table
                     wwd_gui_data[name].object = new qx.ui.table.Table(wwd_gui_data[name].model);

                     // Hide table status bar
                     wwd_gui_data[name].object.setColumnVisibilityButtonVisible(false);
                     wwd_gui_data[name].object.setStatusBarVisible(false);

                     // Set column widths
                     for(var z=0;z<col.length;z++)
                     {
                        wwd_gui_data[name].object.setColumnWidth(z,cwi[z]);
                     }

                     // Add it to parent
                     wwd_gui_data[par].object.add(wwd_gui_data[name].object,{row:ypos,column:xpos,rowSpan:hei,colSpan:wid});

                     // Assign table model
                     wwd_gui_data[name].model.setData(dat);
                     wwd_gui_data[name].object.setTableModel(wwd_gui_data[name].model);

                     // Select first item
                     wwd_gui_data[name].object.setFocusedCell(0,idx,true);

                     // Add event handler
                     wwd_gui_data[name].object.getSelectionModel().addListener("changeSelection",function(e)
                     {
                        wwd_event_handler(this[0],this[1]);
                     },[name,"change"]);
                  }
                  else if(cmds[1].toLowerCase()=="tree")
                  {
                     // Widget name
                     var name = cmds[2];
                     var par  = cmds[3];
                     var xpos = data[0];
                     var ypos = data[1];
                     var wid  = data[2];
                     var hei  = data[3];

                     // Save info
                     wwd_gui_info[name]          = {};
                     wwd_gui_info[name].type     = "tree";
                     wwd_gui_info[name].name     = name;
                     wwd_gui_info[name].parent   = par;
                     wwd_gui_info[name].xpos     = xpos;
                     wwd_gui_info[name].ypos     = ypos;
                     wwd_gui_info[name].width    = wid;
                     wwd_gui_info[name].height   = hei;

                     // Save type
                     wwd_gui_data[name]        = {};
                     wwd_gui_data[name].type   = "tree";
                     wwd_gui_data[name].name   = name;
                     wwd_gui_data[name].parent = par;

                     // Create table
                     wwd_gui_data[name].object = new qx.ui.tree.Tree();

                     // Add it to parent
                     wwd_gui_data[par].object.add(wwd_gui_data[name].object,{row:ypos,column:xpos,rowSpan:hei,colSpan:wid});

                     // Add event handler
                     wwd_gui_data[name].object.addListener("click",function(e)
                     {
                        wwd_event_handler(this[0],this[1]);
                     },[name,"change"]);
                  }
                  else if(cmds[1].toLowerCase()=="date")
                  {
                     // Widget name
                     var name = cmds[2];
                     var par  = cmds[3];
                     var xpos = data[0];
                     var ypos = data[1];
                     var wid  = data[2];
                     var hei  = data[3];
                     var yea  = data[4];
                     var mon  = data[5];
                     var day  = data[6];
                     var dat  = new Date();

                     // Use current date if yea/mon/day are all 0
                     if((yea!=0)&&(mon!=0)&&(day!=0))
                     {
                        dat = new Date(yea,mon-1,day);
                     }

                     // Save info
                     wwd_gui_info[name]        = {};
                     wwd_gui_info[name].type   = "date";
                     wwd_gui_info[name].name   = name;
                     wwd_gui_info[name].parent = par;
                     wwd_gui_info[name].xpos   = xpos;
                     wwd_gui_info[name].ypos   = ypos;
                     wwd_gui_info[name].width  = wid;
                     wwd_gui_info[name].height = hei;
                     wwd_gui_info[name].date   = [dat.getYear()+1900,dat.getMonth()+1,dat.getDate()];

                     // Save type
                     wwd_gui_data[name]        = {};
                     wwd_gui_data[name].type   = "date";
                     wwd_gui_data[name].name   = name;
                     wwd_gui_data[name].parent = par;

                     // Create it
                     wwd_gui_data[name].object = new qx.ui.control.DateChooser(dat);
                     wwd_gui_data[name].object.setValue(dat);

                     // Add it to parent
                     wwd_gui_data[par].object.add(wwd_gui_data[name].object,{row:ypos,column:xpos,rowSpan:hei,colSpan:wid});

                     // Add event handler
                     wwd_gui_data[name].object.addListener("changeValue",function(e)
                     {
                        wwd_event_handler(this[0],this[1]);
                     },[name,"change"]);
                  }
                  else if(cmds[1].toLowerCase()=="datfie")
                  {
                     // Widget name
                     var name = cmds[2];
                     var par  = cmds[3];
                     var xpos = data[0];
                     var ypos = data[1];
                     var wid  = data[2];
                     var hei  = data[3];
                     var yea  = data[4];
                     var mon  = data[5];
                     var day  = data[6];
                     var frm  = data[7];
                     var dat  = new Date();

                     // Use current date if yea/mon/day are all 0
                     if((yea!=0)&&(mon!=0)&&(day!=0))
                     {
                        dat = new Date(yea,mon-1,day);
                     }

                     // Save info
                     wwd_gui_info[name]        = {};
                     wwd_gui_info[name].type   = "datfie";
                     wwd_gui_info[name].name   = name;
                     wwd_gui_info[name].parent = par;
                     wwd_gui_info[name].xpos   = xpos;
                     wwd_gui_info[name].ypos   = ypos;
                     wwd_gui_info[name].width  = wid;
                     wwd_gui_info[name].height = hei;
                     wwd_gui_info[name].format = frm;
                     wwd_gui_info[name].date   = [dat.getYear()+1900,dat.getMonth()+1,dat.getDate()];

                     // Save type
                     wwd_gui_data[name]        = {};
                     wwd_gui_data[name].type   = "datfie";
                     wwd_gui_data[name].name   = name;
                     wwd_gui_data[name].parent = par;

                     // Create it
                     wwd_gui_data[name].object = new qx.ui.form.DateField();
                     wwd_gui_data[name].object.setDateFormat(new qx.util.format.DateFormat(frm,""));
                     wwd_gui_data[name].object.setValue(dat);
                     wwd_gui_data[name].object.getChildControl("textfield").setReadOnly(true);

                     // Add it to parent
                     wwd_gui_data[par].object.add(wwd_gui_data[name].object,{row:ypos,column:xpos,rowSpan:hei,colSpan:wid});

                     // Add event handler
                     wwd_gui_data[name].object.addListener("changeValue",function(e)
                     {
                        wwd_event_handler(this[0],this[1]);
                     },[name,"change"]);
                  }
                  else if(cmds[1].toLowerCase()=="tbar")
                  {
                     // Widget name
                     var name = cmds[2];
                     var par  = cmds[3];
                     var xpos = data[0];
                     var ypos = data[1];
                     var wid  = data[2];
                     var hei  = data[3];

                     // Save info
                     wwd_gui_info[name]          = {};
                     wwd_gui_info[name].type     = "tbar";
                     wwd_gui_info[name].name     = name;
                     wwd_gui_info[name].parent   = par;
                     wwd_gui_info[name].xpos     = xpos;
                     wwd_gui_info[name].ypos     = ypos;
                     wwd_gui_info[name].width    = wid;
                     wwd_gui_info[name].height   = hei;

                     // Save type
                     wwd_gui_data[name]        = {};
                     wwd_gui_data[name].type   = "tbar";
                     wwd_gui_data[name].name   = name;
                     wwd_gui_data[name].parent = par;

                     // Create table
                     wwd_gui_data[name].object = new qx.ui.toolbar.ToolBar();

                     // Add it to parent
                     wwd_gui_data[par].object.add(wwd_gui_data[name].object,{row:ypos,column:xpos,rowSpan:hei,colSpan:wid});
                  }
                  else if(cmds[1].toLowerCase()=="menu")
                  {
                     // Widget name
                     var name = cmds[2];

                     // Save info
                     wwd_gui_info[name]          = {};
                     wwd_gui_info[name].type     = "menu";
                     wwd_gui_info[name].name     = name;

                     // Save type
                     wwd_gui_data[name]        = {};
                     wwd_gui_data[name].type   = "menu";
                     wwd_gui_data[name].name   = name;
                     wwd_gui_data[name].parent = par;

                     // Create table
                     wwd_gui_data[name].object = new qx.ui.menu.Menu();
                  }
                  else if(cmds[1].toLowerCase()=="mbar")
                  {
                     // Widget name
                     var name = cmds[2];
                     var par  = cmds[3];
                     var xpos = data[0];
                     var ypos = data[1];
                     var wid  = data[2];
                     var hei  = data[3];

                     // Save info
                     wwd_gui_info[name]          = {};
                     wwd_gui_info[name].type     = "mbar";
                     wwd_gui_info[name].name     = name;
                     wwd_gui_info[name].parent   = par;
                     wwd_gui_info[name].xpos     = xpos;
                     wwd_gui_info[name].ypos     = ypos;
                     wwd_gui_info[name].width    = wid;
                     wwd_gui_info[name].height   = hei;

                     // Save type
                     wwd_gui_data[name]        = {};
                     wwd_gui_data[name].type   = "mbar";
                     wwd_gui_data[name].name   = name;
                     wwd_gui_data[name].parent = par;

                     // Create table
                     wwd_gui_data[name].object = new qx.ui.menubar.MenuBar();

                     // Add it to parent
                     wwd_gui_data[par].object.add(wwd_gui_data[name].object,{row:ypos,column:xpos,rowSpan:hei,colSpan:wid});
                  }
                  else if(cmds[1].toLowerCase()=="tabs")
                  {
                     // Widget name
                     var name = cmds[2];
                     var par  = cmds[3];
                     var xpos = data[0];
                     var ypos = data[1];
                     var wid  = data[2];
                     var hei  = data[3];

                     // Save info
                     wwd_gui_info[name]          = {};
                     wwd_gui_info[name].type     = "tabs";
                     wwd_gui_info[name].name     = name;
                     wwd_gui_info[name].parent   = par;
                     wwd_gui_info[name].xpos     = xpos;
                     wwd_gui_info[name].ypos     = ypos;
                     wwd_gui_info[name].width    = wid;
                     wwd_gui_info[name].height   = hei;

                     // Save type
                     wwd_gui_data[name]        = {};
                     wwd_gui_data[name].type   = "tabs";
                     wwd_gui_data[name].name   = name;
                     wwd_gui_data[name].parent = par;

                     // Create table
                     wwd_gui_data[name].object = new qx.ui.tabview.TabView();

                     // Add it to parent
                     wwd_gui_data[par].object.add(wwd_gui_data[name].object,{row:ypos,column:xpos,rowSpan:hei,colSpan:wid});

                     // Add event handler
                     // is done when added the first page
                     // When adding the changeSelection event handler here, an
                     // event is fired when a widget is selected
                     // We don't want this behaviour
                  }
                  else if(cmds[1].toLowerCase()=="timer")
                  {
                     // Widget name
                     var name = cmds[2];
                     var intr = data;

                     // Save info
                     wwd_gui_info[name]          = {};
                     wwd_gui_info[name].type     = "timer";
                     wwd_gui_info[name].name     = name;
                     wwd_gui_info[name].interval = intr;
                     wwd_gui_info[name].running  = "false";

                     // Save type
                     wwd_gui_data[name]        = {};
                     wwd_gui_data[name].type   = "timer";
                     wwd_gui_data[name].name   = name;

                     // Create object
                     wwd_gui_data[name].object = new qx.event.Timer(intr);

                     // Add event handler
                     wwd_gui_data[name].object.addListener("interval",function(e)
                     {
                        wwd_event_handler(this[0],this[1]);
                     },[name,"execute"]);
                  }
                  else if(cmds[1].toLowerCase()=="plot")
                  {
                     // Widget name
                     var name = cmds[2];
                     var par  = cmds[3];
                     var xpos = data[0];
                     var ypos = data[1];
                     var wid  = data[2];
                     var hei  = data[3];

                     // Save info
                     wwd_gui_info[name]          = {};
                     wwd_gui_info[name].type     = "plot";
                     wwd_gui_info[name].name     = name;
                     wwd_gui_info[name].parent   = par;
                     wwd_gui_info[name].xpos     = xpos;
                     wwd_gui_info[name].ypos     = ypos;
                     wwd_gui_info[name].width    = wid;
                     wwd_gui_info[name].height   = hei;
                     wwd_gui_info[name].url      = "";

                     // Save type
                     wwd_gui_data[name]        = {};
                     wwd_gui_data[name].type   = "plot";
                     wwd_gui_data[name].name   = name;
                     wwd_gui_data[name].parent = par;

                     // Remove from parent
                     try
                     {
                        wwd_gui_data[par].object.remove(wwd_gui_data[name].object);
                     }
                     catch(e)
                     {
                     }

                     // Set plot url
                     wwd_gui_info[name].url = plot_url;

                     // Create iframe
                     wwd_gui_data[name].object = new qx.ui.embed.Iframe(wwd_gui_info[name].url);

                     // Set options
                     wwd_gui_data[name].object.setNativeContextMenu(true);

                     // Add it to parent
                     wwd_gui_data[par].object.add(wwd_gui_data[name].object,{row:ypos,column:xpos,rowSpan:hei,colSpan:wid});
                  }
                  else
                  {
                     // Unknown widget
                  }
               }
               else if(cmds[0].toLowerCase()=="set") ///////////////////////////
               {
                  // Widget name
                  var name = cmds[1];
                  var opt  = cmds[2];

                  if(wwd_gui_data[name].type=="window")
                  {
                     // Handle option
                     if(opt.toLowerCase()=="visible")
                     {
                        if(data.toLowerCase()=="true")
                        {
                           wwd_gui_info[name].visible = "true";
                           wwd_gui_data[name].object.open();
                        }
                        else if(data.toLowerCase()=="false")
                        {
                           wwd_gui_info[name].visible = "false";
                           wwd_gui_data[name].object.close();
                        }
                        else if(data.toLowerCase()=="main")
                        {
                           // Set window options
                           wwd_gui_data[name].object.setAllowClose(false);
                           wwd_gui_data[name].object.setAllowMinimize(false);
                           wwd_gui_data[name].object.setAllowMaximize(false);
                           wwd_gui_data[name].object.setAlwaysOnTop(true);
                           wwd_gui_data[name].object.setResizable(false,false,false,false);
                           wwd_gui_data[name].object.setShowClose(false);
                           wwd_gui_data[name].object.setShowMaximize(false);
                           wwd_gui_data[name].object.setShowMinimize(false);
                           wwd_gui_data[name].object.maximize();

                           // Hide captionbar
                           wwd_gui_data[name].object.getChildControl("captionbar").setVisibility("excluded");

                           // Browser caption (document title)
                           document.title = wwd_gui_info[name].caption;

                           // Set window visible
                           wwd_gui_info[name].visible = "main";
                           wwd_gui_data[name].object.open();
                        }
                        else
                        {
                           // Unknown option
                        }
                     }
                     else if(opt.toLowerCase()=="modal")
                     {
                        if(data.toLowerCase()=="true")
                        {
                           wwd_gui_info[name].modal = "true";
                           wwd_gui_data[name].object.setModal(true);
                        }
                        else
                        {
                           wwd_gui_info[name].modal = "false";
                           wwd_gui_data[name].object.setModal(false);
                        }
                     }
                     else if(opt.toLowerCase()=="resizable")
                     {
                        if(data.toLowerCase()=="true")
                        {
                           wwd_gui_info[name].resizable = "true";
                           wwd_gui_data[name].object.setResizable(true);
                        }
                        else
                        {
                           wwd_gui_info[name].resizable = "false";
                           wwd_gui_data[name].object.setResizable(false);
                        }
                     }
                     else if(opt.toLowerCase()=="buttons")
                     {
                        if(data[0].toLowerCase()=="true")
                        {
                           wwd_gui_info[name].minimize = "true";
                           wwd_gui_data[name].object.setShowMinimize(true);
                           wwd_gui_data[name].object.setAllowMinimize(true);
                        }
                        else
                        {
                           wwd_gui_info[name].minimize = "false";
                           wwd_gui_data[name].object.setShowMinimize(false);
                           wwd_gui_data[name].object.setAllowMinimize(false);
                        }
                        if(data[1].toLowerCase()=="true")
                        {
                           wwd_gui_info[name].maximize = "true";
                           wwd_gui_data[name].object.setShowMaximize(true);
                           wwd_gui_data[name].object.setAllowMaximize(true);
                        }
                        else
                        {
                           wwd_gui_info[name].maximize = "false";
                           wwd_gui_data[name].object.setShowMaximize(false);
                           wwd_gui_data[name].object.setAllowMaximize(false);
                        }
                        if(data[2].toLowerCase()=="true")
                        {
                           wwd_gui_info[name].close = "true";
                           wwd_gui_data[name].object.setShowClose(true);
                           wwd_gui_data[name].object.setAllowClose(true);
                        }
                        else
                        {
                           wwd_gui_info[name].close = "false";
                           wwd_gui_data[name].object.setShowClose(false);
                           wwd_gui_data[name].object.setAllowClose(false);
                        }
                     }
                     else if(opt.toLowerCase()=="size")
                     {
                        wwd_gui_info[name].width = data[0];
                        wwd_gui_info[name].height = data[1];
                        wwd_gui_data[name].object.setWidth(data[0]);
                        wwd_gui_data[name].object.setHeight(data[1]);
                     }
                     else if(opt.toLowerCase()=="caption")
                     {
                        wwd_gui_info[name].caption = data;
                        wwd_gui_data[name].object.setCaption(data);
                     }
                     else if(opt.toLowerCase()=="status")
                     {
                        if(data.toLowerCase()=="true")
                        {
                           wwd_gui_info[name].status = "true";
                           wwd_gui_data[name].object.setShowStatusbar(true);
                        }
                        else
                        {
                           wwd_gui_info[name].status = "false";
                           wwd_gui_data[name].object.setShowStatusbar(false);
                        }
                     }
                     else if(opt.toLowerCase()=="text")
                     {
                        wwd_gui_info[name].text = data;
                        wwd_gui_data[name].object.setStatus(data);
                     }
                     else
                     {
                        // Unknown option
                     }
                  }
                  else if(wwd_gui_data[name].type=="splitter")
                  {
                     // Handle option
                     if(opt.toLowerCase()=="orientation")
                     {
                        if(data.toLowerCase()=="horizontal")
                        {
                           wwd_gui_info[name].orientation = "horizontal";
                           wwd_gui_data[name].object.setOrientation("horizontal");
                        }
                        else
                        {
                           wwd_gui_info[name].orientation = "vertical";
                           wwd_gui_data[name].object.setOrientation("vertical");
                        }
                     }
                     else
                     {
                        // Unknown option
                     }
                  }
                  else if(wwd_gui_data[name].type=="composite")
                  {
                     // Handle option
                     if(opt.toLowerCase()=="visible")
                     {
                        if(data.toLowerCase()=="true")
                        {
                           wwd_gui_info[name].visible = "true";
                           wwd_gui_data[name].object.show();
                        }
                        else
                        {
                           wwd_gui_info[name].visible = "false";
                           wwd_gui_data[name].object.exclude();
                        }
                     }
                     else if(opt.toLowerCase()=="bgcolor")
                     {
                        if(data.toLowerCase()=="reset")
                        {
                           wwd_gui_info[name].bgcolor = "";
                           wwd_gui_data[name].object.resetBackgroundColor();
                        }
                        else
                        {
                           wwd_gui_info[name].bgcolor = data;
                           wwd_gui_data[name].object.setBackgroundColor(data);
                        }
                     }
                     else if(opt.toLowerCase()=="fgcolor")
                     {
                        if(data.toLowerCase()=="reset")
                        {
                           wwd_gui_info[name].fgcolor = "";
                           wwd_gui_data[name].object.resetTextColor();
                        }
                        else
                        {
                           wwd_gui_info[name].fgcolor = data;
                           wwd_gui_data[name].object.setTextColor(data);
                        }
                     }
                     else
                     {
                        // Unknown option
                     }
                  }
                  else if(wwd_gui_data[name].type=="grid")
                  {
                     // Handle option
                     if(opt.toLowerCase()=="rowspacing")
                     {
                        wwd_gui_info[name].spacingx = data;
                        wwd_gui_data[name].object.setSpacingY(data);
                     }
                     else if(opt.toLowerCase()=="colspacing")
                     {
                        wwd_gui_info[name].spacingy = data;
                        wwd_gui_data[name].object.setSpacingX(data);
                     }
                     else if(opt.toLowerCase()=="rowalign")
                     {
                        wwd_gui_info[name].rowalign = [data[0],data[1],data[2]];
                        wwd_gui_data[name].object.setRowAlign(data[0],data[1],data[2]);
                     }
                     else if(opt.toLowerCase()=="colalign")
                     {
                        wwd_gui_info[name].colalign = [data[0],data[1],data[2]];
                        wwd_gui_data[name].object.setColumnAlign(data[0],data[1],data[2]);
                     }
                     else if(opt.toLowerCase()=="rowmin")
                     {
                        wwd_gui_data[name].object.setRowMinHeight(data[0],data[1]);
                     }
                     else if(opt.toLowerCase()=="rowmax")
                     {
                        wwd_gui_data[name].object.setRowMaxHeight(data[0],data[1]);
                     }
                     else if(opt.toLowerCase()=="colmin")
                     {
                        wwd_gui_data[name].object.setColumnMinWidth(data[0],data[1]);
                     }
                     else if(opt.toLowerCase()=="colmax")
                     {
                        wwd_gui_data[name].object.setColumnMaxWidth(data[0],data[1]);
                     }
                     else
                     {
                        // Unknown option
                     }
                  }
                  else if(wwd_gui_data[name].type=="label")
                  {
                     // Handle option
                     if(opt.toLowerCase()=="text")
                     {
                        wwd_gui_info[name].text = data;
                        wwd_gui_data[name].object.setValue(data);
                     }
                     else if(opt.toLowerCase()=="bgcolor")
                     {
                        if(data.toLowerCase()=="reset")
                        {
                           wwd_gui_info[name].bgcolor = "";
                           wwd_gui_data[name].object.resetBackgroundColor();
                        }
                        else
                        {
                           wwd_gui_info[name].bgcolor = data;
                           wwd_gui_data[name].object.setBackgroundColor(data);
                        }
                     }
                     else if(opt.toLowerCase()=="fgcolor")
                     {
                        if(data.toLowerCase()=="reset")
                        {
                           wwd_gui_info[name].fgcolor = "";
                           wwd_gui_data[name].object.resetTextColor();
                        }
                        else
                        {
                           wwd_gui_info[name].fgcolor = data;
                           wwd_gui_data[name].object.setTextColor(data);
                        }
                     }
                     else
                     {
                        // Unknown option
                     }
                  }
                  else if(wwd_gui_data[name].type=="image")
                  {
                     // Handle option
                     if(opt.toLowerCase()=="image")
                     {
                        wwd_gui_info[name].image = data;
                        wwd_gui_data[name].object.setSource(data);
                     }
                     else
                     {
                        // Unknown option
                     }
                  }
                  else if(wwd_gui_data[name].type=="button")
                  {
                     // Handle option
                     if(opt.toLowerCase()=="text")
                     {
                        wwd_gui_info[name].text = data;
                        wwd_gui_data[name].object.setLabel(data);
                     }
                     else if(opt.toLowerCase()=="icon")
                     {
                        wwd_gui_info[name].icon = data;
                        wwd_gui_data[name].object.setIcon(data);
                     }
                     else
                     {
                        // Unknown option
                     }
                  }
                  else if(wwd_gui_data[name].type=="field")
                  {
                     // Handle option
                     if(opt.toLowerCase()=="text")
                     {
                        wwd_gui_info[name].text = data;
                        wwd_gui_data[name].object.setValue(data);
                     }
                     else if(opt.toLowerCase()=="readonly")
                     {
                        if(data.toLowerCase()=="true")
                        {
                           wwd_gui_info[name].readonly = "true";
                           wwd_gui_data[name].object.setReadOnly(true);
                        }
                        else
                        {
                           wwd_gui_info[name].readonly = "false";
                           wwd_gui_data[name].object.setReadOnly(false);
                        }
                     }
                     else if(opt.toLowerCase()=="bgcolor")
                     {
                        if(data.toLowerCase()=="reset")
                        {
                           wwd_gui_info[name].bgcolor = "";
                           wwd_gui_data[name].object.resetBackgroundColor();
                        }
                        else
                        {
                           wwd_gui_info[name].bgcolor = data;
                           wwd_gui_data[name].object.setBackgroundColor(data);
                        }
                     }
                     else if(opt.toLowerCase()=="fgcolor")
                     {
                        if(data.toLowerCase()=="reset")
                        {
                           wwd_gui_info[name].fgcolor = "";
                           wwd_gui_data[name].object.resetTextColor();
                        }
                        else
                        {
                           wwd_gui_info[name].fgcolor = data;
                           wwd_gui_data[name].object.setTextColor(data);
                        }
                     }
                     else
                     {
                        // Unknown option
                     }
                  }
                  else if(wwd_gui_data[name].type=="pass")
                  {
                     // Handle option
                     if(opt.toLowerCase()=="text")
                     {
                        wwd_gui_info[name].text = data;
                        wwd_gui_data[name].object.setValue(data);
                     }
                     else if(opt.toLowerCase()=="readonly")
                     {
                        if(data.toLowerCase()=="true")
                        {
                           wwd_gui_info[name].readonly = "true";
                           wwd_gui_data[name].object.setReadOnly(true);
                        }
                        else
                        {
                           wwd_gui_info[name].readonly = "false";
                           wwd_gui_data[name].object.setReadOnly(false);
                        }
                     }
                     else if(opt.toLowerCase()=="bgcolor")
                     {
                        if(data.toLowerCase()=="reset")
                        {
                           wwd_gui_info[name].bgcolor = "";
                           wwd_gui_data[name].object.resetBackgroundColor();
                        }
                        else
                        {
                           wwd_gui_info[name].bgcolor = data;
                           wwd_gui_data[name].object.setBackgroundColor(data);
                        }
                     }
                     else if(opt.toLowerCase()=="fgcolor")
                     {
                        if(data.toLowerCase()=="reset")
                        {
                           wwd_gui_info[name].fgcolor = "";
                           wwd_gui_data[name].object.resetTextColor();
                        }
                        else
                        {
                           wwd_gui_info[name].fgcolor = data;
                           wwd_gui_data[name].object.setTextColor(data);
                        }
                     }
                     else
                     {
                        // Unknown option
                     }
                  }
                  else if(wwd_gui_data[name].type=="area")
                  {
                     // Handle option
                     if(opt.toLowerCase()=="text")
                     {
                        wwd_gui_info[name].text = data;
                        wwd_gui_data[name].object.setValue(data);
                     }
                     else if(opt.toLowerCase()=="readonly")
                     {
                        if(data.toLowerCase()=="true")
                        {
                           wwd_gui_info[name].readonly = "true";
                           wwd_gui_data[name].object.setReadOnly(true);
                        }
                        else
                        {
                           wwd_gui_info[name].readonly = "false";
                           wwd_gui_data[name].object.setReadOnly(false);
                        }
                     }
                     else if(opt.toLowerCase()=="bgcolor")
                     {
                        if(data.toLowerCase()=="reset")
                        {
                           wwd_gui_info[name].bgcolor = "";
                           wwd_gui_data[name].object.resetBackgroundColor();
                        }
                        else
                        {
                           wwd_gui_info[name].bgcolor = data;
                           wwd_gui_data[name].object.setBackgroundColor(data);
                        }
                     }
                     else if(opt.toLowerCase()=="fgcolor")
                     {
                        if(data.toLowerCase()=="reset")
                        {
                           wwd_gui_info[name].fgcolor = "";
                           wwd_gui_data[name].object.resetTextColor();
                        }
                        else
                        {
                           wwd_gui_info[name].fgcolor = data;
                           wwd_gui_data[name].object.setTextColor(data);
                        }
                     }
                     else
                     {
                        // Unknown option
                     }
                  }
                  else if(wwd_gui_data[name].type=="check")
                  {
                     // Handle option
                     if(opt.toLowerCase()=="text")
                     {
                        wwd_gui_info[name].text = data;
                        wwd_gui_data[name].object.setLabel(data);
                     }
                     else if(opt.toLowerCase()=="checked")
                     {
                        if(data.toLowerCase()=="true")
                        {
                           wwd_gui_info[name].checked = data;
                           wwd_gui_data[name].object.setValue(true);
                        }
                        else
                        {
                           wwd_gui_info[name].checked = data;
                           wwd_gui_data[name].object.setValue(false);
                        }
                     }
                     else
                     {
                        // Unknown option
                     }
                  }
                  else if(wwd_gui_data[name].type=="radio")
                  {
                     // Handle option
                     if(opt.toLowerCase()=="text")
                     {
                        wwd_gui_info[name].text = data;
                        wwd_gui_data[name].object.setLabel(data);
                     }
                     else if(opt.toLowerCase()=="checked")
                     {
                        if(data.toLowerCase()=="true")
                        {
                           wwd_gui_info[name].checked = data;
                           wwd_gui_data[name].object.setValue(true);
                        }
                        else
                        {
                           wwd_gui_info[name].checked = data;
                           wwd_gui_data[name].object.setValue(false);
                        }
                     }
                     else
                     {
                        // Unknown option
                     }
                  }
                  else if(wwd_gui_data[name].type=="list")
                  {
                     // Handle option
                     if(opt.toLowerCase()=="data")
                     {
                        // Disable change event
                        wwd_process_event = false;

                        // Create model
                        wwd_gui_data[name].model = qx.data.marshal.Json.createModel(data[0][0]);

                        // Set list model
                        wwd_gui_data[name].object.setModel(wwd_gui_data[name].model);

                        // Select first item
                        wwd_gui_data[name].object.getSelection().push(wwd_gui_data[name].model.getItem(data[1]));

                        // Save info
                        wwd_gui_info[name].data     = data[0][0];
                        wwd_gui_info[name].selected = data[1];

                        // Enable change event
                        wwd_process_event = true;
                     }
                     else if(opt.toLowerCase()=="selected")
                     {
                        // Disable change event
                        wwd_process_event = false;

                        // Select item
                        wwd_gui_data[name].object.getSelection().push(wwd_gui_data[name].model.getItem(data));

                        // Save info
                        wwd_gui_info[name].selected = data;

                        // Enable change event
                        wwd_process_event = true;
                     }
                     else
                     {
                        // Unknown option
                     }
                  }
                  else if(wwd_gui_data[name].type=="select")
                  {
                     // Handle option
                     if(opt.toLowerCase()=="data")
                     {
                        // Disable change event
                        wwd_process_event = false;

                        // Remove all data
                        wwd_gui_data[name].object.removeAll();

                        // Add data
                        for(var z=0;z<data[0].length;z++)
                        {
                           wwd_gui_data[name].object.add(new qx.ui.form.ListItem(data[0][z]));
                        }

                        // Update gui info
                        wwd_gui_info[name].data     = data[0];
                        wwd_gui_info[name].selected = data[0][0];

                        // Enable change event
                        wwd_process_event = true;
                     }
                     else
                     {
                        // Unknown option
                     }
                  }
                  else if(wwd_gui_data[name].type=="combo")
                  {
                     // Handle option
                     if(opt.toLowerCase()=="data")
                     {
                        // Disable change event
                        wwd_process_event = false;

                        // Set value
                        wwd_gui_data[name].object.setValue(data[0]);

                        // Remove all data
                        wwd_gui_data[name].object.removeAll();

                        // Add data
                        for(var z=0;z<data[1][0].length;z++)
                        {
                           wwd_gui_data[name].object.add(new qx.ui.form.ListItem(data[1][0][z]));
                        }

                        // Update gui info
                        wwd_gui_info[name].text     = data[0];
                        wwd_gui_info[name].data     = data[1][0];

                        // Enable change event
                        wwd_process_event = true;
                     }
                     else
                     {
                        // Unknown option
                     }
                  }
                  else if(wwd_gui_data[name].type=="table")
                  {
                     // Handle option
                     if(opt.toLowerCase()=="columns")
                     {
                        // Set columns
                        wwd_gui_data[name].model.setColumns(data[0][0]);

                        // Save info
                        wwd_gui_info[name].columns = data[0][0];
                     }
                     else if(opt.toLowerCase()=="coltype")
                     {
                        // Column and alignment
                        var col = data[0];
                        var typ = data[1];
                        var mod = wwd_gui_data[name].object.getTableColumnModel();

                        // Set cell renderer
                        if(typ.toLowerCase()=="string")
                        {
                           mod.setDataCellRenderer(col,new qx.ui.table.cellrenderer.String());
                        }
                        else if(typ.toLowerCase()=="number")
                        {
                           mod.setDataCellRenderer(col,new qx.ui.table.cellrenderer.Number());
                        }
                        else
                        {
                           // Unknown type
                        }
                     }
                     else if(opt.toLowerCase()=="data")
                     {
                        // Disable change event
                        wwd_process_event = false;

                        // Assign table model
                        wwd_gui_data[name].model.setData(data[0][0]);
                        wwd_gui_data[name].object.updateContent();

                        // Select first item
                        wwd_gui_data[name].object.setFocusedCell(0,data[1],true);

                        // Save info
                        wwd_gui_info[name].data     = data[0][0];
                        wwd_gui_info[name].selected = data[0][0][data[1]];

                        // Enable change event
                        wwd_process_event = true;
                     }
                     else if(opt.toLowerCase()=="selected")
                     {
                        // Disable change event
                        wwd_process_event = false;

                        // Select first item
                        wwd_gui_data[name].object.setFocusedCell(0,data,true);

                        // Save info
                        wwd_gui_info[name].selected = wwd_gui_info[name].data[data];

                        // Enable change event
                        wwd_process_event = true;
                     }
                     else
                     {
                        // Unknown option
                     }
                  }
                  else if((wwd_gui_data[name].type=="treefolder")||(wwd_gui_data[name].type=="treefile"))
                  {
                     // Handle option
                     if(opt.toLowerCase()=="text")
                     {
                        wwd_gui_info[name].text = data;
                        wwd_gui_data[name].object.setLabel(data);
                     }
                     else if(opt.toLowerCase()=="icon")
                     {
                        wwd_gui_info[name].icon = data;
                        wwd_gui_data[name].object.setIcon(data);
                     }
                     else
                     {
                        // Unknown option
                     }
                  }
                  else if(wwd_gui_data[name].type=="date")
                  {
                     // Handle option
                     if(opt.toLowerCase()=="date")
                     {
                        // Current date
                        var yea = data[0];
                        var mon = data[1];
                        var day = data[2];
                        var dat = new Date();

                        // Use current date if yea/mon/day are all 0
                        if((yea!=0)&&(mon!=0)&&(day!=0))
                        {
                           dat = new Date(yea,mon-1,day);
                        }

                        // Disable event processing
                        wwd_process_event = false;

                        // Update gui
                        wwd_gui_info[name].date = [dat.getYear()+1900,dat.getMonth()+1,dat.getDate()];
                        wwd_gui_data[name].object.setValue(dat);

                        // Enable event processing
                        wwd_process_event = true;
                     }
                     else
                     {
                        // Unknown option
                     }
                  }
                  else if(wwd_gui_data[name].type=="datfie")
                  {
                     // Handle option
                     if(opt.toLowerCase()=="date")
                     {
                        // Current date
                        var yea = data[0];
                        var mon = data[1];
                        var day = data[2];
                        var dat = new Date();

                        // Use current date if yea/mon/day are all 0
                        if((yea!=0)&&(mon!=0)&&(day!=0))
                        {
                           dat = new Date(yea,mon-1,day);
                        }

                        // Disable event processing
                        wwd_process_event = false;

                        // Update gui
                        wwd_gui_info[name].date = [dat.getYear()+1900,dat.getMonth()+1,dat.getDate()];
                        wwd_gui_data[name].object.setValue(dat);

                        // Enable event processing
                        wwd_process_event = true;
                     }
                     else if(opt.toLowerCase()=="format")
                     {
                        // Set date format
                        wwd_gui_data[name].object.setDateFormat(new qx.util.format.DateFormat(data,""));
                     }
                     else
                     {
                        // Unknown option
                     }
                  }
                  else if(wwd_gui_data[name].type=="tbbut")
                  {
                     // Handle option
                     if(opt.toLowerCase()=="text")
                     {
                        wwd_gui_info[name].text = data;
                        wwd_gui_data[name].object.setLabel(data);
                     }
                     else if(opt.toLowerCase()=="icon")
                     {
                        wwd_gui_info[name].icon = data;
                        wwd_gui_data[name].object.setIcon(data);
                     }
                     else
                     {
                        // Unknown option
                     }
                  }
                  else if(wwd_gui_data[name].type=="mbut")
                  {
                     // Handle option
                     if(opt.toLowerCase()=="text")
                     {
                        wwd_gui_info[name].text = data;
                        wwd_gui_data[name].object.setLabel(data);
                     }
                     else if(opt.toLowerCase()=="icon")
                     {
                        wwd_gui_info[name].icon = data;
                        wwd_gui_data[name].object.setIcon(data);
                     }
                     else
                     {
                        // Unknown option
                     }
                  }
                  else if(wwd_gui_data[name].type=="tabs")
                  {
                     // Handle option
                     if(opt.toLowerCase()=="active")
                     {
                        // Disable event processing
                        wwd_process_event = false;

                        // Update gui
                        wwd_gui_info[name].selected = wwd_gui_data[data].object.getLabel();
                        wwd_gui_data[name].object.setSelection([wwd_gui_data[data].object]);

                        // Enable event processing
                        wwd_process_event = true;
                     }
                     else
                     {
                        // Unknown option
                     }
                  }
                  else if(wwd_gui_data[name].type=="page")
                  {
                     // Handle option
                     if(opt.toLowerCase()=="text")
                     {
                        wwd_gui_info[name].text = data;
                        wwd_gui_data[name].object.setLabel(data);
                     }
                     else if(opt.toLowerCase()=="icon")
                     {
                        wwd_gui_info[name].icon = data;
                        wwd_gui_data[name].object.setIcon(data);
                     }
                     else
                     {
                        // Unknown option
                     }
                  }
                  else if(wwd_gui_data[name].type=="timer")
                  {
                     // Handle option
                     if(opt.toLowerCase()=="interval")
                     {
                        wwd_gui_info[name].interval = data;
                        wwd_gui_data[name].object.setInterval(data);
                     }
                     else if(opt.toLowerCase()=="start")
                     {
                        wwd_gui_info[name].running = "true";
                        wwd_gui_data[name].object.start();
                     }
                     else if(opt.toLowerCase()=="stop")
                     {
                        wwd_gui_info[name].running = "false";
                        wwd_gui_data[name].object.stop();
                     }
                     else
                     {
                        // Unknown option
                     }
                  }
                  else
                  {
                     // Unknown type
                  }
               }
               else if(cmds[0].toLowerCase()=="add") ///////////////////////////
               {
                  // Widget name
                  var opt = cmds[1];
                  var nam = cmds[2];
                  var par = cmds[3];

                  if((wwd_gui_data[par].type=="tree")||(wwd_gui_data[par].type=="treefolder")||(wwd_gui_data[par].type=="treefile"))
                  {
                     // Text and icon
                     var tex = data[0];
                     var ico = data[1];

                     if(opt.toLowerCase()=="root")
                     {
                        // Add new root item
                        wwd_gui_data[nam]        = {};
                        wwd_gui_data[nam].type   = "treefolder";
                        wwd_gui_data[nam].name   = nam;
                        wwd_gui_data[nam].parent = par;
                        wwd_gui_data[nam].object = new qx.ui.tree.TreeFolder(tex);
                        wwd_gui_data[par].object.setRoot(wwd_gui_data[nam].object);

                        // Set icon
                        wwd_gui_data[nam].object.setIcon(ico);

                        // Open root
                        wwd_gui_data[nam].object.setOpen(true);

                        // Save info
                        wwd_gui_info[nam]        = {};
                        wwd_gui_info[nam].type   = "treefolder";
                        wwd_gui_info[nam].name   = nam;
                        wwd_gui_info[nam].parent = par;
                        wwd_gui_info[nam].text   = tex;
                        wwd_gui_info[nam].icon   = ico;
                     }
                     else if(opt.toLowerCase()=="folder")
                     {
                        // Add new item
                        wwd_gui_data[nam]        = {};
                        wwd_gui_data[nam].type   = "treefolder";
                        wwd_gui_data[nam].name   = nam;
                        wwd_gui_data[nam].parent = par;
                        wwd_gui_data[nam].object = new qx.ui.tree.TreeFolder(tex);
                        wwd_gui_data[par].object.add(wwd_gui_data[nam].object);

                        // Set icon
                        wwd_gui_data[nam].object.setIcon(ico);

                        // Save info
                        wwd_gui_info[nam]        = {};
                        wwd_gui_info[nam].type   = "treefolder";
                        wwd_gui_info[nam].name   = nam;
                        wwd_gui_info[nam].parent = par;
                        wwd_gui_info[nam].text   = tex;
                        wwd_gui_info[nam].icon   = ico;
                     }
                     else if(opt.toLowerCase()=="file")
                     {
                        // Add new item
                        wwd_gui_data[nam]        = {};
                        wwd_gui_data[nam].type   = "treefile";
                        wwd_gui_data[nam].name   = nam;
                        wwd_gui_data[nam].parent = par;
                        wwd_gui_data[nam].object = new qx.ui.tree.TreeFile(tex);
                        wwd_gui_data[par].object.add(wwd_gui_data[nam].object);

                        // Set icon
                        wwd_gui_data[nam].object.setIcon(ico);

                        // Save info
                        wwd_gui_info[nam]        = {};
                        wwd_gui_info[nam].type   = "treefile";
                        wwd_gui_info[nam].name   = nam;
                        wwd_gui_info[nam].parent = par;
                        wwd_gui_info[nam].text   = tex;
                        wwd_gui_info[nam].icon   = ico;
                     }
                     else
                     {
                        // Unknown option
                     }
                  }
                  else if(wwd_gui_data[par].type=="tbar")
                  {
                     // Text and icon
                     var tex = data[0];
                     var ico = data[1];

                     if(opt.toLowerCase()=="button")
                     {
                        // Create toolbar button
                        wwd_gui_data[nam]        = {};
                        wwd_gui_data[nam].type   = "tbbut";
                        wwd_gui_data[nam].name   = nam;
                        wwd_gui_data[nam].parent = par;
                        wwd_gui_data[nam].object = new qx.ui.toolbar.Button(tex,ico);

                        // Add event handler
                        wwd_gui_data[nam].object.addListener("execute",function(e)
                        {
                           wwd_event_handler(this[0],this[1]);
                        },[nam,"execute"]);

                        // Add button to toolbar
                        wwd_gui_data[par].object.add(wwd_gui_data[nam].object);

                        // Save info
                        wwd_gui_info[nam]        = {};
                        wwd_gui_info[nam].type   = "tbbut";
                        wwd_gui_info[nam].name   = nam;
                        wwd_gui_info[nam].parent = par;
                        wwd_gui_info[nam].text   = tex;
                        wwd_gui_info[nam].icon   = ico;
                     }
                     else if(opt.toLowerCase()=="separator")
                     {
                        // Create toolbar separator
                        wwd_gui_data[nam]        = {};
                        wwd_gui_data[nam].type   = "tbsep";
                        wwd_gui_data[nam].name   = nam;
                        wwd_gui_data[nam].parent = par;
                        wwd_gui_data[nam].object = new qx.ui.toolbar.Separator();

                        // Add separator to toolbar
                        wwd_gui_data[par].object.add(wwd_gui_data[nam].object);

                        // Save info
                        wwd_gui_info[nam]        = {};
                        wwd_gui_info[nam].type   = "tbsep";
                        wwd_gui_info[nam].name   = nam;
                        wwd_gui_info[nam].parent = par;
                     }
                     else
                     {
                        // Unknown option
                     }
                  }
                  else if(wwd_gui_data[par].type=="mbar")
                  {
                     // Text and icon
                     var nam = cmds[1];
                     var men = cmds[2];
                     var par = cmds[3];
                     var tex = data;

                     // Create toolbar button
                     wwd_gui_data[nam]        = {};
                     wwd_gui_data[nam].type   = "mbbut";
                     wwd_gui_data[nam].name   = nam;
                     wwd_gui_data[nam].parent = par;
                     wwd_gui_data[nam].object = new qx.ui.menubar.Button(tex,null,wwd_gui_data[men].object);

                     // Add menu to menubar
                     wwd_gui_data[par].object.add(wwd_gui_data[nam].object);

                     // Save info
                     wwd_gui_info[nam]        = {};
                     wwd_gui_info[nam].type   = "mbbut";
                     wwd_gui_info[nam].name   = nam;
                     wwd_gui_info[nam].parent = par;
                     wwd_gui_info[nam].text   = tex;
                  }
                  else if(wwd_gui_data[par].type=="menu")
                  {
                     // Text and icon
                     var tex = data[0];
                     var ico = data[1];

                     if(opt.toLowerCase()=="button")
                     {
                        // Create toolbar button
                        wwd_gui_data[nam]        = {};
                        wwd_gui_data[nam].type   = "mbut";
                        wwd_gui_data[nam].name   = nam;
                        wwd_gui_data[nam].parent = par;
                        wwd_gui_data[nam].object = new qx.ui.menu.Button(tex,ico);

                        // Add event handler
                        wwd_gui_data[nam].object.addListener("execute",function(e)
                        {
                           wwd_event_handler(this[0],this[1]);
                        },[nam,"execute"]);

                        // Add button to toolbar
                        wwd_gui_data[par].object.add(wwd_gui_data[nam].object);

                        // Save info
                        wwd_gui_info[nam]        = {};
                        wwd_gui_info[nam].type   = "mbut";
                        wwd_gui_info[nam].name   = nam;
                        wwd_gui_info[nam].parent = par;
                        wwd_gui_info[nam].text   = tex;
                        wwd_gui_info[nam].icon   = ico;
                     }
                     else if(opt.toLowerCase()=="separator")
                     {
                        // Create toolbar separator
                        wwd_gui_data[nam]        = {};
                        wwd_gui_data[nam].type   = "msep";
                        wwd_gui_data[nam].name   = nam;
                        wwd_gui_data[nam].parent = par;
                        wwd_gui_data[nam].object = new qx.ui.menu.Separator();

                        // Add separator to toolbar
                        wwd_gui_data[par].object.add(wwd_gui_data[nam].object);

                        // Save info
                        wwd_gui_info[nam]        = {};
                        wwd_gui_info[nam].type   = "msep";
                        wwd_gui_info[nam].name   = nam;
                        wwd_gui_info[nam].parent = par;
                     }
                     else
                     {
                        // Unknown option
                     }
                  }
                  else if(wwd_gui_data[par].type=="tabs")
                  {
                     if(opt.toLowerCase()=="page")
                     {
                        // Create toolbar button
                        wwd_gui_data[nam]        = {};
                        wwd_gui_data[nam].type   = "page";
                        wwd_gui_data[nam].name   = nam;
                        wwd_gui_data[nam].parent = par;
                        wwd_gui_data[nam].object = new qx.ui.tabview.Page(data[0],data[1]);

                        // Add menu to menubar
                        wwd_gui_data[par].object.add(wwd_gui_data[nam].object);

                        // Save info
                        wwd_gui_info[nam]        = {};
                        wwd_gui_info[nam].type   = "page";
                        wwd_gui_info[nam].name   = nam;
                        wwd_gui_info[nam].parent = par;
                        wwd_gui_info[nam].text   = data[0];
                        wwd_gui_info[nam].icon   = data[1];

                        // Get number of pages
                        var npg = wwd_gui_data[par].object.getSelectables().length;

                        // When the 1st page is added, we select it
                        // We add the event handler when the first page is added,
                        // to avoid the first unwanted changeSelection event, when
                        // a widget in the page fires an event
                        if(npg==1)
                        {
                           // Disable event processing
                           wwd_process_event = false;

                           // Update gui
                           wwd_gui_info[par].selected = wwd_gui_data[nam].object.getLabel();
                           wwd_gui_data[par].object.setSelection([wwd_gui_data[nam].object]);

                           // Add event handler
                           wwd_gui_data[name].object.addListener("changeSelection",function(e)
                           {
                              wwd_event_handler(this[0],this[1]);
                           },[name,"change"]);

                           // Enable event processing
                           wwd_process_event = true;
                        }
                     }
                     else
                     {
                        // Unknown option
                     }
                  }
                  else
                  {
                     // Unknown type
                  }
               }
               else
               {
                  // Unknown command
               }
            } // for(var i=0;i<arr.length;i++)

         } // function wwd_exec

         //////////////////////////////////////////////////////////////////////////
         // Tab key handler for text areas
         //////////////////////////////////////////////////////////////////////////

         // Use this functioin as an event listener for "keydown" event
         // Example: <widget>.addListener("keydown",tab_key_handler,<widget>);
         function tab_key_handler(e)
         {
            // Specify soft tab
            var tab = "   ";

            // Get key id
            var kid = e.getKeyIdentifier().toLowerCase();

            // Special key handling
            if(kid=="tab")
            {
               // Disable default tab key handling
               e.preventDefault();

               // Get html dom element
               var ele = this.getContentElement().getDomElement();

               // Get text area value
               var val = this.getValue();

               // If there is no text (null) use empty text
               if(val==null) val = "";

               // Get text before and after caret
               var sta = qx.bom.Selection.getStart(ele);
               var bef = val.substring(0,sta);
               var aft = val.substring(sta);

               // Insert tab (3 spaces)
               this.setValue(bef+tab+aft);

               // Place the caret after the tab
               var car = sta + tab.length;

               // The whole text wil be selected unless we use a timeout
               setTimeout(function()
               {
                  qx.bom.Selection.set(ele,car,car);
               },10);
            }
         }

         //////////////////////////////////////////////////////////////////////////
         // Server send function
         //////////////////////////////////////////////////////////////////////////

         // Send message to server
         function server_send(jsonobj)
         {
            // Create new XML HTTP request object
            var xmlhttp = new XMLHttpRequest();

            // Establish server message receiver
            // In synchronous mode, we don't need a receiver function
            //xmlhttp.onreadystatechange = funcptr;

            // Open POST request in synchronous mode
            // 3rd parameter: sync = false, ansync = true
            // In ansync mode it is not guaranteed that responses are
            // incoming in the same order they were sent
            xmlhttp.open("POST","/handler",false);

            // Set request header
            xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded;charset=UTF-8");

            // Build JSON string for transfer
            var jsonstr = JSON.stringify(jsonobj);

            // Send JSON string
            xmlhttp.send("json="+jsonstr);

            // Get response text
            jsonstr = xmlhttp.responseText;

            // Build JSON object from received string
            jsonobj = JSON.parse(jsonstr);

            // Return
            return jsonobj;
         }

         ///////////////////////////////////////////////////////////////////////
         // Receive terminal output
         ///////////////////////////////////////////////////////////////////////

         // Receive terminal output
         function receive_terminal_output()
         {
            // Local variables
            var val = "";
            var out = "";
            var pos =  0;

            // Timer
            if(!tor_timer_started)
            {
               tor_timer_started = true;
               timer_manager.start(function(dat,tid)
               {
                  // We setup an error handler on this timer driven function,
                  // because when a large number of events are fired in a very
                  // short time, this functions generates errors. If we catch
                  // errors, it doesn't matter.
                  try
                  {
                     // Check whether J is busy or not
                     json = server_send({head:{fcode:"term",scode:"busy"},data:""});
                     if(json.head.rcode=="INF")
                     {
                        // Check busy
                        if(json.head.rmesg=="true")
                        {
                           // Do nothing ... waiting
                        }
                        else // Not busy, ready to get output
                        {
                           // Receive normal output
                           json = server_send({head:{fcode:"term",scode:"recv"},data:""});
                           if(json.head.rcode=="INF")
                           {
                              // Get output
                              out = json.data;

                              // Normal output (out) goes to terminal
                              if(out!="")
                              {
                                 // Handle edit file from the command line (Request from John Baker)
                                 if(out.startsWith("$$$edit$$$"))
                                 {
                                    // Extract file name from out
                                    fil = out.substring(10);
                                    pos = fil.search("\n");
                                    if(pos>-1)
                                    {
                                       fil = fil.substring(0,pos);
                                    }

                                    // Get file or directory contents
                                    json = server_send({head:{fcode:"navi",scode:"goto"},data:fil});
                                    if(json.head.rcode=="INF")
                                    {
                                       // Check whether file or directory
                                       if(json.head.rmesg=="DIR")
                                       {
                                          navi_dir_label.setValue(json.data.path);
                                          navi_dir_label.getContentElement().scrollToX(1000);
                                          navi_file_tree_fill(json.data.files);
                                       }
                                       else
                                       {
                                          // Get file and text
                                          var fil = json.data.file;
                                          var tex = json.data.text;

                                          // Add edit page
                                          add_edit_page(fil,tex);
                                       }
                                    }
                                    else
                                    {
                                       // Error message
                                       show_server_error();

                                       // Stop timer
                                       tor_timer_started = false;
                                       wwd_process_event = true;
                                       timer_manager.stop(tid);

                                       // Return
                                       return;
                                    }
                                 }
                                 else
                                 {
                                    // Add out to terminal output
                                    val = this.getValue();
                                    val = val + out;
                                    this.setValue(val);
                                    this.setTextSelection(val.length);
                                    this.getContentElement().scrollToY(100000);
                                 }
                              }
                           }
                           else
                           {
                              // Error message
                              show_server_error();

                              // Stop timer
                              tor_timer_started = false;
                              wwd_process_event = true;
                              timer_manager.stop(tid);

                              // Return
                              return;
                           }

                           // Receive plot output
                           json = server_send({head:{fcode:"term",scode:"recv"},data:"plot"});
                           if(json.head.rcode=="INF")
                           {
                              // Get output
                              out = json.data;

                              // Check output
                              if(out!="")
                              {
                                 // Is there a plot iframe in wwd_gui_data ?
                                 var nam = "";
                                 var fnd = false;
                                 for(nam in wwd_gui_data)
                                 {
                                    if(wwd_gui_data[nam].type=="plot")
                                    {
                                       fnd = true;
                                       break;
                                    }
                                 }

                                 // If a plot iframe was found
                                 if(fnd)
                                 {
                                    // Remove from parent
                                    try
                                    {
                                       wwd_gui_data[wwd_gui_data[nam].parent].object.remove(wwd_gui_data[nam].object);
                                    }
                                    catch(e)
                                    {
                                    }

                                    // Create iframe
                                    wwd_gui_data[nam].object = new qx.ui.embed.Iframe(wwd_gui_info[nam].url);

                                    // Set options
                                    wwd_gui_data[nam].object.setNativeContextMenu(true);

                                    // Add it to parent
                                    wwd_gui_data[wwd_gui_data[nam].parent].object.add(wwd_gui_data[nam].object,
                                       {row:wwd_gui_info[nam].ypos,column:wwd_gui_info[nam].xpos,rowSpan:wwd_gui_info[nam].height,colSpan:wwd_gui_info[nam].width});
                                 }
                                 else
                                 {
                                    // Set plot output
                                    plot_view_cont.remove(edit_plot_area);
                                    edit_plot_area = new qx.ui.embed.Iframe(plot_url);
                                    edit_plot_area.setNativeContextMenu(true);
                                    plot_view_cont.add(edit_plot_area);
                                 }
                              }
                           }
                           else
                           {
                              // Error message
                              show_server_error();

                              // Stop timer
                              tor_timer_started = false;
                              wwd_process_event = true;
                              timer_manager.stop(tid);

                              // Return
                              return;
                           }

                           // Receive gui output
                           json = server_send({head:{fcode:"term",scode:"recv"},data:"gui"});
                           if(json.head.rcode=="INF")
                           {
                              // Get output
                              out = json.data;

                              // Check output
                              if(out!="")
                              {
                                 // Pass out to wwd
                                 wwd_exec(out);
                              }
                           }
                           else
                           {
                              // Error message
                              show_server_error();

                              // Stop timer
                              tor_timer_started = false;
                              wwd_process_event = true;
                              timer_manager.stop(tid);

                              // Return
                              return;
                           }

                           // Stop timer
                           tor_timer_started = false;
                           wwd_process_event = true;
                           timer_manager.stop(tid);
                        }
                     }
                     else
                     {
                        // Error message
                        show_server_error();

                        // Stop timer
                        tor_timer_started = false;
                        wwd_process_event = true;
                        timer_manager.stop(tid);

                        // Return
                        return;
                     }
                  }
                  catch(e)
                  {
                     // Output error
                     // alert("receive_terminal_output: " + e);

                     // Stop timer
                     tor_timer_started = false;
                     wwd_process_event = true;
                     timer_manager.stop(tid);
                  }
               },100,edit_term_area,null,0);
            }
         }

         //*********************************************************************
         // J IDE GUI
         //*********************************************************************

         ///////////////////////////////////////////////////////////////////////
         // Message & Input box
         ///////////////////////////////////////////////////////////////////////

         // The message box
         function qjide_message_box(typ,tit,tex)
         {
            // Check if there is already a visible message box
            if(qjide_message_box_visible)
            {
               return;
            }
            else
            {
               qjide_message_box_visible = true;
            }

            // Create dialog window
            var win = new qx.ui.window.Window(tit);
            win.setWidth(320);
            win.setHeight(120);
            win.setShowMinimize(false);
            win.setShowMaximize(false);
            win.setShowClose(false);
            win.setAllowMinimize(false);
            win.setAllowMaximize(false);
            win.setAllowClose(false);
            win.setResizable(false);
            win.setModal(true);

            // Add resize listeners to center window
            win.addListener("resize",win.center,win);
            root.addListener("resize",win.center,win);

            // Create grid layout
            var grid = new qx.ui.layout.Grid(1,1);

            // Setup grid parameters
            grid.setSpacing(10);
            grid.setRowAlign(0,"left","middle");
            grid.setRowAlign(1,"left","middle");
            grid.setRowAlign(2,"left","middle");
            grid.setColumnWidth(0, 60);
            grid.setColumnWidth(1,210);
            grid.setColumnWidth(2,210);

            // Apply grid layout to win
            win.setLayout(grid);

            // Create labels and text fields
            var message_box_icon = new qx.ui.basic.Image("resource/qjide/info.png");
            var message_box_text = new qx.ui.basic.Label(tex);

            // Change icon in dependence of message box type
            if(typ.toUpperCase()=="WARNING")
            {
               message_box_icon.setSource("resource/qjide/warning.png");
            }
            else if(typ.toUpperCase()=="ERROR")
            {
               message_box_icon.setSource("resource/qjide/error.png");
            }

            // Set properties
            message_box_text.setWidth(420);
            message_box_text.setRich(true);

            // Add widgets to window
            //win.add(new qx.ui.core.Spacer(5,5),  {row:0,column:0});
            win.add(message_box_icon,{row:0,column:0,colSpan:1});
            win.add(message_box_text,{row:0,column:1,colSpan:2});

            // Add OK button
            var message_box_ok_button = new qx.ui.form.Button("OK");

            // Add button to container at fixed coordinates
            win.add(new qx.ui.core.Spacer(5,50),{row:1,column:0});
            win.add(message_box_ok_button,{row:2,column:2});

            // Add an event listener for cust_edit_ok
            message_box_ok_button.addListener("execute", function(e)
            {
               // Close and destroy window
               qjide_message_box_visible = false;
               win.close();
               win.destroy();
            });

            // Add window to root
            root.add(win);

            // Open window
            win.open();
         }

         // The Yes/No box
         function qjide_yesno_box(typ,tit,tex)
         {
            // Check if there is already a visible yesno box
            if(qjide_yesno_box_visible)
            {
               return;
            }
            else
            {
               qjide_yesno_box_visible = true;
            }

            // Create dialog window
            var win = new qx.ui.window.Window(tit);
            win.setWidth(320);
            win.setHeight(120);
            win.setShowMinimize(false);
            win.setShowMaximize(false);
            win.setShowClose(false);
            win.setAllowMinimize(false);
            win.setAllowMaximize(false);
            win.setAllowClose(false);
            win.setResizable(false);
            win.setModal(true);

            // Add resize listeners to center window
            win.addListener("resize",win.center,win);
            root.addListener("resize",win.center,win);

            // Create grid layout
            var grid = new qx.ui.layout.Grid(1,1);

            // Setup grid parameters
            grid.setSpacing(10);
            grid.setRowAlign(0,"left","middle");
            grid.setRowAlign(1,"left","middle");
            grid.setRowAlign(2,"left","middle");
            grid.setColumnWidth(0, 60);
            grid.setColumnWidth(1,210);
            grid.setColumnWidth(2,210);

            // Apply grid layout to win
            win.setLayout(grid);

            // Create labels and text fields
            var yesno_box_icon = new qx.ui.basic.Image("resource/qjide/attention.png");
            var yesno_box_text = new qx.ui.basic.Label(tex);

            // Set properties
            yesno_box_text.setWidth(420);
            yesno_box_text.setRich(true);

            // Add widgets to window
            //win.add(new qx.ui.core.Spacer(5,5),  {row:0,column:0});
            win.add(yesno_box_icon,{row:0,column:0,colSpan:1});
            win.add(yesno_box_text,{row:0,column:1,colSpan:2});

            // Add buttons
            var yesno_box_yes_button = new qx.ui.form.Button("Yes");
            var yesno_box_no_button  = new qx.ui.form.Button("No");

            // Add button to container at fixed coordinates
            win.add(new qx.ui.core.Spacer(5,50),{row:1,column:0});
            win.add(yesno_box_yes_button,{row:2,column:1});
            win.add(yesno_box_no_button, {row:2,column:2});

            // Add an event listener for yes
            yesno_box_yes_button.addListener("execute", function(e)
            {
               // Check type
               if(typ.toUpperCase()=="DISCARD")
               {
                  discard_current_edit_page();
               }

               // Close and destroy window
               qjide_yesno_box_visible = false;
               win.close();
               win.destroy();
            });

            // Add an event listener for no
            yesno_box_no_button.addListener("execute", function(e)
            {
               // Close and destroy window
               qjide_yesno_box_visible = false;
               win.close();
               win.destroy();
            });

            // Add window to root
            root.add(win);

            // Open window
            win.open();
         }

         // The input box
         function qjide_input_box(typ,tit,lab,tex)
         {
            // Check if there is already a visible input box
            if(qjide_input_box_visible)
            {
               return;
            }
            else
            {
               qjide_input_box_visible = true;
            }

            // Create dialog window
            var win = new qx.ui.window.Window(tit);
            win.setWidth(320);
            win.setHeight(120);
            win.setShowMinimize(false);
            win.setShowMaximize(false);
            win.setShowClose(false);
            win.setAllowMinimize(false);
            win.setAllowMaximize(false);
            win.setAllowClose(false);
            win.setResizable(false);
            win.setModal(true);

            // Add resize listeners to center window
            win.addListener("resize",win.center,win);
            root.addListener("resize",win.center,win);

            // Create grid layout
            var grid = new qx.ui.layout.Grid(1,1);

            // Setup grid parameters
            grid.setSpacing(10);
            grid.setRowAlign(0,"left","middle");
            grid.setRowAlign(1,"left","middle");
            grid.setRowAlign(2,"left","middle");
            grid.setRowAlign(3,"left","middle");
            grid.setColumnWidth(0,160);
            grid.setColumnWidth(1,160);

            // Apply grid layout to win
            win.setLayout(grid);

            // Create labels and text fields
            var input_box_label = new qx.ui.basic.Label(lab);
            var input_box_text  = new qx.ui.form.TextField(tex);

            // Set properties
            input_box_text.focus();
            input_box_label.setRich(true);

            // Add widgets to window
            win.add(input_box_label,{row:0,column:0,colSpan:2});
            win.add(input_box_text ,{row:1,column:0,colSpan:2});

            // Add OK & Cancel button
            var input_box_ok_button     = new qx.ui.form.Button("OK");
            var input_box_cancel_button = new qx.ui.form.Button("Cancel");

            // Add button to container at fixed coordinates
            win.add(new qx.ui.core.Spacer(5,50),{row:2,column:0});
            win.add(input_box_ok_button,{row:3,column:0});
            win.add(input_box_cancel_button,{row:3,column:1});

            // Add an event listener for ok
            input_box_ok_button.addListener("execute", function(e)
            {
               // Check type
               if(typ.toUpperCase()=="NEW")
               {
                  add_edit_page(input_box_text.getValue(),"NB. " + input_box_text.getValue() + "\r\n\r\n");
               }
               else if(typ.toUpperCase()=="SAVEAS")
               {
                  saveas_current_edit_page(input_box_text.getValue());
               }

               // Close and destroy window
               qjide_input_box_visible = false;
               win.close();
               win.destroy();
            });

            // Add an event listener for cancel
            input_box_cancel_button.addListener("execute", function(e)
            {
               // Close and destroy window
               qjide_input_box_visible = false;
               win.close();
               win.destroy();
            });

            // Add window to root
            root.add(win);

            // Open window
            win.open();
         }

         // Show server error
         function show_server_error()
         {
            // Error message
            qjide_message_box("ERROR",
                              "Server Request Error: " + json.head.fcode + "/" + json.head.scode,
                              json.head.rmesg);
         }

         ///////////////////////////////////////////////////////////////////////
         // Lab selector
         ///////////////////////////////////////////////////////////////////////

         // The lab selector
         function qjide_lab_selector()
         {
            // Create dialog window
            var win = new qx.ui.window.Window("Select Lab");
            win.setWidth(640);
            win.setHeight(480);
            win.setShowMinimize(false);
            win.setShowMaximize(false);
            win.setShowClose(false);
            win.setAllowMinimize(false);
            win.setAllowMaximize(false);
            win.setAllowClose(false);
            win.setResizable(false);
            win.setModal(true);

            // Set window layout
            win.setLayout(new qx.ui.layout.Grow());

            // Add resize listeners to center window
            win.addListener("resize",win.center,win);
            root.addListener("resize",win.center,win);

            // Create root container
            var labsel_root_container = new qx.ui.container.Composite(new qx.ui.layout.Dock());

            // Create title bar container
            var labsel_title_bar = new qx.ui.container.Composite(new qx.ui.layout.Dock());

            // Create left title bar label
            var labsel_title_label_left = new qx.ui.basic.Label("Select a lab to run.");
            labsel_title_label_left.setRich(true);

            // Create right title bar label
            var labsel_title_label_right = new qx.ui.basic.Label("To advance the running lab, press: Alt+J");
            labsel_title_label_right.setRich(true);
            labsel_title_label_right.setTextAlign("right");

            // Add label and image to the title bar container
            labsel_title_bar.add(labsel_title_label_left, {edge:"west"});
            labsel_title_bar.add(labsel_title_label_right,{edge:"east"});

            // Create dummy label
            var labsel_title_label_dummy = new qx.ui.basic.Label("&nbsp;");
            labsel_title_label_dummy.setRich(true);

            // Create main splitter
            var labsel_main_split = new qx.ui.splitpane.Pane("horizontal");
            var labsel_cat_cont   = new qx.ui.container.Composite(new qx.ui.layout.Dock());
            var labsel_lab_cont   = new qx.ui.container.Composite(new qx.ui.layout.Dock());

            // Add split areas 1:1
            labsel_main_split.add(labsel_cat_cont,1);
            labsel_main_split.add(labsel_lab_cont,1);

            // Variables
            var rawlabs = [];
            var rawfils = [];

            // Get all available labs
            json = server_send({head:{fcode:"labs",scode:"available"},data:""});
            if(json.head.rcode=="INF")
            {
               // Available labs
               rawlabs = json.data;
            }
            else
            {
               // Error message
               show_server_error();

               // Return
               return;
            }

            // Get all available lab files
            json = server_send({head:{fcode:"labs",scode:"files"},data:""});
            if(json.head.rcode=="INF")
            {
               // Available labs
               rawfils = json.data;
            }
            else
            {
               // Error message
               show_server_error();

               // Return
               return;
            }

            // Split into categroies and labs
            var cats = ["All"];
            var labs = {};
            var albs = [];
            for(var i=0;i<rawlabs.length;i++)
            {
               var raw = rawlabs[i];
               var pos = raw.indexOf(":");
               var cat = raw.substr(0,pos);
               var lab = raw.substr(pos+2);
               var fnd = false;
               cat = cat.substr(0,1).toUpperCase() + cat.substr(1);
               albs[albs.length] = lab;
               for(var j=0;j<cats.length;j++)
               {
                  if(cats[j]==cat)
                  {
                     fnd = true;
                  }
               }
               if(fnd==false)
               {
                  cats[cats.length] = cat;
               }
               try
               {
                  labs[cat][labs[cat].length] = lab;
               }
               catch(err)
               {
                  labs[cat] = [];
                  labs[cat][labs[cat].length] = lab;
               }
               labs["All"] = albs;
            }

            // Create models
            var labsel_cat_model = qx.data.marshal.Json.createModel(cats);
            var labsel_lab_model = qx.data.marshal.Json.createModel(albs);

            // Create lists
            var labsel_cat_list = new qx.ui.list.List(labsel_cat_model);
            var labsel_lab_list = new qx.ui.list.List(labsel_lab_model);

            // Add lists to container
            labsel_cat_cont.add(labsel_cat_list);
            labsel_lab_cont.add(labsel_lab_list);

            // Select first category and lab
            labsel_cat_list.getSelection().push(labsel_cat_model.getItem(0));
            labsel_lab_list.getSelection().push(labsel_lab_model.getItem(0));

            // Category list event handler
            labsel_cat_list.getSelection().addListener("change",function(e)
            {
               // Get selected category
               cat = labsel_cat_list.getSelection().getItem(0);

               // Get labs for category
               labsel_lab_model = qx.data.marshal.Json.createModel(labs[cat]);

               // Set new model
               labsel_lab_list.setModel(labsel_lab_model);

               // Select first lab in category
               labsel_lab_list.getSelection().push(labsel_lab_model.getItem(0));
            },this);

            // Create dummy label
            var labsel_bottom_label_dummy = new qx.ui.basic.Label("&nbsp;");
            labsel_bottom_label_dummy.setRich(true);

            // Create button grid
            var labsel_button_grid = new qx.ui.layout.Grid(1,1);
            var labsel_button_cont = new qx.ui.container.Composite(labsel_button_grid);

            // Setup grid parameters
            labsel_button_grid.setSpacing(10);
            labsel_button_grid.setRowAlign(0,"left", "middle");
            labsel_button_grid.setRowAlign(1,"left", "middle");
            labsel_button_grid.setRowAlign(2,"right","middle");
            labsel_button_grid.setRowAlign(3,"right","middle");
            labsel_button_grid.setColumnWidth(0,150);
            labsel_button_grid.setColumnWidth(1,150);
            labsel_button_grid.setColumnWidth(2,150);
            labsel_button_grid.setColumnWidth(3,150);

            // Add Run Lab & Close buttons
            var labsel_run_button   = new qx.ui.form.Button("Run Lab");
            var labsel_close_button = new qx.ui.form.Button("Close");

            // Run button action
            labsel_run_button.addListener("execute",function()
            {
               // Get category and lab
               cat = labsel_cat_list.getSelection().getItem(0);
               lab = labsel_lab_list.getSelection().getItem(0);

               // Search for rawlab in rawlabs
               for(var i=0;i<rawlabs.length;i++)
               {
                  if(rawlabs[i].indexOf(lab)>=0) break;
               }
               var rawfil = rawfils[i];

               // Ensure proper encoding
               rawfil = rawfil.replace(/\\/g,"\\\\");
               rawfil = rawfil.replace(/\"/g,"\\\"");
               rawfil = encodeURIComponent(rawfil);

               // Run lab file
               json = server_send({head:{fcode:"labs",scode:"start"},data:rawfil});
               if(json.head.rcode=="INF")
               {
                  // Do nothing
               }
               else
               {
                  // Error message
                  show_server_error();

                  // Return
                  return;
               }

               // Receive terminal output
               receive_terminal_output();

               // Close window
               win.close();
               win.destroy();
            },this);

            // Close button action
            labsel_close_button.addListener("execute",function()
            {
               win.close();
               win.destroy();
            },this);

            // Add buttons to container
            labsel_button_cont.add(labsel_run_button,  {row:0,column:2,colSpan:1});
            labsel_button_cont.add(labsel_close_button,{row:0,column:3,colSpan:1});

            // Add widgets to root container
            labsel_root_container.add(labsel_title_bar,         {edge:"north" });
            labsel_root_container.add(labsel_title_label_dummy, {edge:"north" });
            labsel_root_container.add(labsel_main_split,        {edge:"center"});
            labsel_root_container.add(labsel_button_cont,       {edge:"south" });
            labsel_root_container.add(labsel_bottom_label_dummy,{edge:"south" });

            // Add gui to win
            win.add(labsel_root_container);

            // Add window to root
            root.add(win);

            // Open window
            win.open();
         }

         ///////////////////////////////////////////////////////////////////////
         // Package manager
         ///////////////////////////////////////////////////////////////////////

         // The package manager
         function qjide_package_manager()
         {
            // Create dialog window
            var win = new qx.ui.window.Window("Package Manager");
            win.setWidth(800);
            win.setHeight(600);
            win.setShowMinimize(false);
            win.setShowMaximize(false);
            win.setShowClose(false);
            win.setAllowMinimize(false);
            win.setAllowMaximize(false);
            win.setAllowClose(false);
            win.setResizable(false);
            win.setModal(true);

            // Set window layout
            win.setLayout(new qx.ui.layout.Grow());

            // Add resize listeners to center window
            win.addListener("resize",win.center,win);
            root.addListener("resize",win.center,win);

            // Pacman table data
            var pacman_table_data = [];

            // Pacman categories
            var pacman_addons_categroy_array = ["All"];

            // Check whether we are online or not //////////////////////////////

            // Check online
            json = server_send({head:{fcode:"pacman",scode:"check"},data:""});
            if(json.head.rcode=="INF")
            {
               // Check json.data
               if(json.data=="0")
               {
                  qx.event.Timer.once(function()
                  {
                     qjide_message_box("WARNING",
                                       "Not online",
                                       "You are not connected to the internet.");
                  },this,100);
               }
            }
            else
            {
               // Error message
               show_server_error();

               // Return
               return;
            }

            // Layout //////////////////////////////////////////////////////////

            // Create root container
            var pacman_root_container = new qx.ui.container.Composite(new qx.ui.layout.Dock());

            // Create main splitter
            var pacman_main_split = new qx.ui.splitpane.Pane("horizontal");
            var pacman_left_cont  = new qx.ui.container.Composite(new qx.ui.layout.Dock());
            var pacman_right_cont = new qx.ui.container.Composite(new qx.ui.layout.Dock());

            pacman_left_cont.setBackgroundColor("#afafaf");

            // Add split areas 1:5
            pacman_main_split.add(pacman_left_cont, 1);
            pacman_main_split.add(pacman_right_cont,4);

            // Create right splitter
            var pacman_right_split = new qx.ui.splitpane.Pane("vertical");
            var pacman_top_cont    = new qx.ui.container.Composite(new qx.ui.layout.Grow());
            var pacman_bottom_cont = new qx.ui.container.Composite(new qx.ui.layout.Grow());

            // Add split area 3:1
            pacman_right_split.add(pacman_top_cont,   1);
            pacman_right_split.add(pacman_bottom_cont,1);

            // Add right split to right container
            pacman_right_cont.add(pacman_right_split,{edge:"center"});

            // Tabs ////////////////////////////////////////////////////////////

            // Create tabs for left container
            var pacman_left_tabs = new qx.ui.tabview.TabView("top");
            pacman_left_tabs.setBackgroundColor("#afafaf");
            pacman_left_tabs.setContentPadding(0,0,0,0);

            // Create pages
            var pacman_addons_status_page = new qx.ui.tabview.Page("Status");
            pacman_addons_status_page.setLayout(new qx.ui.layout.Grow());
            var pacman_addons_category_page = new qx.ui.tabview.Page("Category");
            pacman_addons_category_page.setLayout(new qx.ui.layout.Grow());

            //Add pages to tab view
            pacman_left_tabs.add(pacman_addons_status_page  );
            pacman_left_tabs.add(pacman_addons_category_page);

            // Add tab view to left container
            pacman_left_cont.add(pacman_left_tabs,{edge:"center"});

            // Create tabs for bottom container
            var pacman_bottom_tabs = new qx.ui.tabview.TabView("top");
            pacman_bottom_tabs.setBackgroundColor("#afafaf");
            pacman_bottom_tabs.setContentPadding(0,0,0,0);

            // Create pages
            var pacman_package_summary_page = new qx.ui.tabview.Page("Summary");
            pacman_package_summary_page.setLayout(new qx.ui.layout.Grow());
            var pacman_package_history_page = new qx.ui.tabview.Page("History");
            pacman_package_history_page.setLayout(new qx.ui.layout.Grow());
            var pacman_package_manifest_page = new qx.ui.tabview.Page("Manifest");
            pacman_package_manifest_page.setLayout(new qx.ui.layout.Grow());
            var pacman_install_log_page = new qx.ui.tabview.Page("Log");
            pacman_install_log_page.setLayout(new qx.ui.layout.Grow());

            //Add pages to tab view
            pacman_bottom_tabs.add(pacman_install_log_page     );
            pacman_bottom_tabs.add(pacman_package_summary_page );
            pacman_bottom_tabs.add(pacman_package_history_page );
            pacman_bottom_tabs.add(pacman_package_manifest_page);

            // Add tab view to navi container
            pacman_bottom_cont.add(pacman_bottom_tabs);

            // Left tab page contents //////////////////////////////////////////

            // Model arrays
            var pacman_addons_status_array   = ["All","Upgrades","Installed","Not Installed"];
            var pacman_addons_categroy_array = ["All","Dummy 1","Dummy 2"];

            // Create models
            var pacman_addons_status_model   = qx.data.marshal.Json.createModel(pacman_addons_status_array  );
            var pacman_addons_category_model = qx.data.marshal.Json.createModel(pacman_addons_categroy_array);

            // Create lists
            var pacman_addons_status_list   = new qx.ui.list.List(pacman_addons_status_model  );
            var pacman_addons_category_list = new qx.ui.list.List(pacman_addons_category_model);

            // Add lists to container
            pacman_addons_status_page.add(pacman_addons_status_list);
            pacman_addons_category_page.add(pacman_addons_category_list);

            // Select first status and category
            pacman_addons_status_list.getSelection().push(pacman_addons_status_model.getItem(0));
            pacman_addons_category_list.getSelection().push(pacman_addons_category_model.getItem(0));

            // Handle tab selection
            pacman_left_tabs.addListener("changeSelection",function(e)
            {
               if(pacman_left_tabs.isSelected(pacman_addons_status_page))
               {
                  // Get package data
                  json = server_send({head:{fcode:"pacman",scode:"getall"},data:""});
                  if(json.head.rcode=="INF")
                  {
                     // Build pacman table data
                     pacman_table_data = [];
                     for(var i=0;i<json.data.length;i++)
                     {
                        var row = [false].concat(json.data[i]);
                        pacman_table_data[pacman_table_data.length] = row;
                     }
                  }
                  else
                  {
                     // Error message
                     show_server_error();

                     // Return
                     return;
                  }

                  // Select first item
                  pacman_addons_status_list.getSelection().push(pacman_addons_status_model.getItem(0));
               }
               else if(pacman_left_tabs.isSelected(pacman_addons_category_page))
               {
                  // Get categories
                  json = server_send({head:{fcode:"pacman",scode:"categories"},data:""});
                  if(json.head.rcode=="INF")
                  {
                     // Build pacman table data
                     pacman_addons_categroy_array = ["All"];
                     for(var i=0;i<json.data.length;i++)
                     {
                        pacman_addons_categroy_array[pacman_addons_categroy_array.length] = json.data[i];
                     }
                  }
                  else
                  {
                     // Error message
                     show_server_error();

                     // Return
                     return;
                  }

                  // Update list
                  pacman_addons_category_model = qx.data.marshal.Json.createModel(pacman_addons_categroy_array);
                  pacman_addons_category_list.setModel(pacman_addons_category_model);

                  // Get package data
                  json = server_send({head:{fcode:"pacman",scode:"getall"},data:""});
                  if(json.head.rcode=="INF")
                  {
                     // Build pacman table data
                     pacman_table_data = [];
                     for(var i=0;i<json.data.length;i++)
                     {
                        var row = [false].concat(json.data[i]);
                        pacman_table_data[pacman_table_data.length] = row;
                     }
                  }
                  else
                  {
                     // Error message
                     show_server_error();

                     // Return
                     return;
                  }

                  // Select first item
                  pacman_addons_category_list.getSelection().push(pacman_addons_category_model.getItem(0));
               }

               // Update browser
               pacman_package_model.setData(pacman_table_data);
               pacman_package_table.setTableModel(pacman_package_model);
            },this);

            // Status list event handler
            pacman_addons_status_list.getSelection().addListener("change",function(e)
            {
               // Get selected status
               var sta = pacman_addons_status_list.getSelection().getItem(0);

               // Invoke action in dependence of sta
               if(sta=="All")
               {
                  json = server_send({head:{fcode:"pacman",scode:"getall"},data:""});
                  if(json.head.rcode=="INF")
                  {
                     // Build pacman table data
                     pacman_table_data = [];
                     for(var i=0;i<json.data.length;i++)
                     {
                        var row = [false].concat(json.data[i]);
                        pacman_table_data[pacman_table_data.length] = row;
                     }
                  }
                  else
                  {
                     // Error message
                     show_server_error();

                     // Return
                     return;
                  }
               }
               else if(sta=="Upgrades")
               {
                  json = server_send({head:{fcode:"pacman",scode:"upgrades"},data:""});
                  if(json.head.rcode=="INF")
                  {
                     // Build pacman table data
                     pacman_table_data = [];
                     for(var i=0;i<json.data.length;i++)
                     {
                        var row = [false].concat(json.data[i]);
                        pacman_table_data[pacman_table_data.length] = row;
                     }
                  }
                  else
                  {
                     // Error message
                     show_server_error();

                     // Return
                     return;
                  }
               }
               else if(sta=="Installed")
               {
                  json = server_send({head:{fcode:"pacman",scode:"installed"},data:""});
                  if(json.head.rcode=="INF")
                  {
                     // Build pacman table data
                     pacman_table_data = [];
                     for(var i=0;i<json.data.length;i++)
                     {
                        var row = [false].concat(json.data[i]);
                        pacman_table_data[pacman_table_data.length] = row;
                     }
                  }
                  else
                  {
                     // Error message
                     show_server_error();

                     // Return
                     return;
                  }
               }
               else if(sta=="Not Installed")
               {
                  json = server_send({head:{fcode:"pacman",scode:"notinstalled"},data:""});
                  if(json.head.rcode=="INF")
                  {
                     // Build pacman table data
                     pacman_table_data = [];
                     for(var i=0;i<json.data.length;i++)
                     {
                        var row = [false].concat(json.data[i]);
                        pacman_table_data[pacman_table_data.length] = row;
                     }
                  }
                  else
                  {
                     // Error message
                     show_server_error();

                     // Return
                     return;
                  }
               }

               // Update browser
               pacman_package_model.setData(pacman_table_data);
               pacman_package_table.setTableModel(pacman_package_model);
            },this);

            // Category list event handler
            pacman_addons_category_list.getSelection().addListener("change",function(e)
            {
               // Get selected category
               var cat = pacman_addons_category_list.getSelection().getItem(0);

               if(cat=="All")
               {
                  // Get package data of all packages
                  json = server_send({head:{fcode:"pacman",scode:"getall"},data:""});
                  if(json.head.rcode=="INF")
                  {
                     // Build pacman table data
                     pacman_table_data = [];
                     for(var i=0;i<json.data.length;i++)
                     {
                        var row = [false].concat(json.data[i]);
                        pacman_table_data[pacman_table_data.length] = row;
                     }
                  }
                  else
                  {
                     // Error message
                     show_server_error();

                     // Return
                     return;
                  }
               }
               else
               {
                  // Get package data of selected category
                  json = server_send({head:{fcode:"pacman",scode:"category"},data:cat});
                  if(json.head.rcode=="INF")
                  {
                     // Build pacman table data
                     pacman_table_data = [];
                     for(var i=0;i<json.data.length;i++)
                     {
                        var row = [false].concat(json.data[i]);
                        pacman_table_data[pacman_table_data.length] = row;
                     }
                  }
                  else
                  {
                     // Error message
                     show_server_error();

                     // Return
                     return;
                  }
               }

               // Update browser
               pacman_package_model.setData(pacman_table_data);
               pacman_package_table.setTableModel(pacman_package_model);
            },this);

            // Package browser /////////////////////////////////////////////////

            // Browser model
            var pacman_package_model = new qx.ui.table.model.Simple();

            // Set table columns
            pacman_package_model.setColumns(["","Package","Installed","Latest","Caption"]);

            // Disable sorting
            pacman_package_model.setColumnSortable(0,false);
            pacman_package_model.setColumnSortable(1,false);
            pacman_package_model.setColumnSortable(2,false);
            pacman_package_model.setColumnSortable(3,false);
            pacman_package_model.setColumnSortable(4,false);

            // Table data
            json = server_send({head:{fcode:"pacman",scode:"getall"},data:""});
            if(json.head.rcode=="INF")
            {
               // Build pacman table data
               for(var i=0;i<json.data.length;i++)
               {
                  var row = [false].concat(json.data[i]);
                  pacman_table_data[pacman_table_data.length] = row;
               }
            }
            else
            {
               // Error message
               show_server_error();

               // Return
               return;
            }
            /*
            var pacman_table_data = [[false,"api/expat","1.0","1.1","Dummy text 1"],
                                     [true, "api/gdi32","1.3","2.2","Dummy text 2"]];
            */

            // Create table
            var pacman_package_table = new qx.ui.table.Table(pacman_package_model);

            // Hide table status bar
            pacman_package_table.setColumnVisibilityButtonVisible(false);
            pacman_package_table.setStatusBarVisible(false);

            // Cell renderer for column 0 checkboxes
            var pacman_package_table_column_model = pacman_package_table.getTableColumnModel();
            pacman_package_table_column_model.setDataCellRenderer(0,new qx.ui.table.cellrenderer.Boolean());

            // Set table column widths
            pacman_package_table.setColumnWidth(0, 30);
            pacman_package_table.setColumnWidth(1,160);
            pacman_package_table.setColumnWidth(2, 80);
            pacman_package_table.setColumnWidth(3, 80);
            pacman_package_table.setColumnWidth(4,280);

            // Add package browser to container
            pacman_top_cont.add(pacman_package_table);

            // Assign table model
            pacman_package_model.setData(pacman_table_data);
            pacman_package_table.setTableModel(pacman_package_model);

            // Cell click action
            pacman_package_table.addListener("cellTap",function()
            {
               // Get clicked (selected) row and column
               var row = pacman_package_table.getFocusedRow();
               var col = pacman_package_table.getFocusedColumn();

               // If column 0 was clicked, change selection flag
               if(col==0)
               {
                  pacman_table_data[row][col] = !pacman_table_data[row][col];
               }

               // Update browser
               pacman_package_model.setData(pacman_table_data);
               pacman_package_table.setTableModel(pacman_package_model);

               // Get info for selected package
               json = server_send({head:{fcode:"pacman",scode:"info"},data:pacman_table_data[row][1]});
               if(json.head.rcode=="INF")
               {
                  // Set info texts
                  pacman_package_summary_text.setValue ("" + json.data.summary );
                  pacman_package_history_text.setValue ("" + json.data.history );
                  pacman_package_manifest_text.setValue("" + json.data.manifest);
               }
               else
               {
                  // Error message
                  show_server_error();

                  // Return
                  return;
               }

               // Updat J wiki button
               pacman_wiki_button.setLabel("Goto J Wiki: " + pacman_table_data[row][1]);
            },this);

            // Bottom tab page contents ////////////////////////////////////////

            // Create text areas
            var pacman_package_summary_text  = new qx.ui.form.TextArea();
            var pacman_package_history_text  = new qx.ui.form.TextArea();
            var pacman_package_manifest_text = new qx.ui.form.TextArea();
            var pacman_install_log_text      = new qx.ui.form.TextArea();

            // Set text areas properties
            pacman_package_summary_text.setFont(edit_text_font);
            pacman_package_summary_text.setReadOnly(true);
            pacman_package_summary_text.setDecorator(null);
            pacman_package_summary_text.setBackgroundColor("#fcfcdd");
            pacman_package_summary_text.setTextColor("#000000");
            pacman_package_summary_text.setNativeContextMenu(false);

            pacman_package_history_text.setFont(edit_text_font);
            pacman_package_history_text.setReadOnly(true);
            pacman_package_history_text.setDecorator(null);
            pacman_package_history_text.setBackgroundColor("#fcfcdd");
            pacman_package_history_text.setTextColor("#000000");
            pacman_package_history_text.setNativeContextMenu(false);

            pacman_package_manifest_text.setFont(edit_text_font);
            pacman_package_manifest_text.setReadOnly(true);
            pacman_package_manifest_text.setDecorator(null);
            pacman_package_manifest_text.setBackgroundColor("#fcfcdd");
            pacman_package_manifest_text.setTextColor("#000000");
            pacman_package_manifest_text.setNativeContextMenu(false);

            pacman_install_log_text.setFont(edit_text_font);
            pacman_install_log_text.setReadOnly(true);
            pacman_install_log_text.setDecorator(null);
            pacman_install_log_text.setBackgroundColor("#fcfcdd");
            pacman_install_log_text.setTextColor("#000000");
            pacman_install_log_text.setNativeContextMenu(false);

            // Set dummy values
            pacman_install_log_text.setValue("");
            pacman_package_summary_text.setValue("");
            pacman_package_history_text.setValue("");
            pacman_package_manifest_text.setValue("");

            // Add text areas to their corresponding pages
            pacman_package_summary_page.add(pacman_package_summary_text);
            pacman_package_history_page.add(pacman_package_history_text);
            pacman_package_manifest_page.add(pacman_package_manifest_text);
            pacman_install_log_page.add(pacman_install_log_text);

            // Get pacman status
            json = server_send({head:{fcode:"pacman",scode:"status"},data:""});
            if(json.head.rcode=="INF")
            {
               // Set info texts
               pacman_install_log_text.setValue(json.data);
            }
            else
            {
               // Error message
               show_server_error();

               // Return
               return;
            }

            // Buttons /////////////////////////////////////////////////////////

            // Selection buttons
            var pacman_selectall_button = new qx.ui.form.Button("Select All");
            var pacman_clearall_button  = new qx.ui.form.Button("Clear All" );

            // Installation buttons
            var pacman_install_button = new qx.ui.form.Button("Install Selected");
            var pacman_uninstall_button = new qx.ui.form.Button("Uninstall Selected");

            // Add tab view to left container
            pacman_left_cont.add(pacman_uninstall_button,   {edge:"south"});
            pacman_left_cont.add(pacman_install_button,     {edge:"south"});
            pacman_left_cont.add(new qx.ui.core.Spacer(0,5),{edge:"south"});
            pacman_left_cont.add(pacman_clearall_button,    {edge:"south"});
            pacman_left_cont.add(pacman_selectall_button,   {edge:"south"});

            // Create button grid
            var pacman_button_grid = new qx.ui.layout.Grid(1,1);
            var pacman_button_cont = new qx.ui.container.Composite(pacman_button_grid);

            // Setup grid parameters
            pacman_button_grid.setSpacing(10);
            pacman_button_grid.setRowAlign(0,"right","middle");
            pacman_button_grid.setRowAlign(1,"right","middle");
            pacman_button_grid.setRowAlign(2,"right","middle");
            pacman_button_grid.setRowAlign(3,"right","middle");
            pacman_button_grid.setColumnWidth(0,200);
            pacman_button_grid.setColumnWidth(1,200);
            pacman_button_grid.setColumnWidth(2,200);
            pacman_button_grid.setColumnWidth(3,200);

            // Add buttons
            var pacman_update_button  = new qx.ui.form.Button("Update from Server");
            var pacman_rebuild_button = new qx.ui.form.Button("Rebuild Repository");
            var pacman_wiki_button    = new qx.ui.form.Button("Goto J Wiki: ...");
            var pacman_close_button   = new qx.ui.form.Button("Close");

            // Select all button action
            pacman_selectall_button.addListener("execute",function()
            {
               // Update package data
               for(var row=0;row<pacman_table_data.length;row++)
               {
                  pacman_table_data[row][0] = true;
               }

               // Update browser
               pacman_package_model.setData(pacman_table_data);
               pacman_package_table.setTableModel(pacman_package_model);
            },this);

            // Clear all button action
            pacman_clearall_button.addListener("execute",function()
            {
               // Update package data
               for(var row=0;row<pacman_table_data.length;row++)
               {
                  pacman_table_data[row][0] = false;
               }

               // Update browser
               pacman_package_model.setData(pacman_table_data);
               pacman_package_table.setTableModel(pacman_package_model);
            },this);

            // Install button action
            pacman_install_button.addListener("execute",function()
            {
               // Activate install log page
               pacman_bottom_tabs.setSelection([pacman_install_log_page]);

               // Clear log text
               pacman_install_log_text.setValue("");

               // Loop over selected packages
               for(var i=0;i<pacman_table_data.length;i++)
               {
                  // Check whether package ist selected
                  if(pacman_table_data[i][0])
                  {
                     // Get package name
                     var pacnam = pacman_table_data[i][1];

                     // Install package
                     json = server_send({head:{fcode:"pacman",scode:"install"},data:pacnam});
                     if(json.head.rcode=="INF")
                     {
                        // Update install log
                        var curval = pacman_install_log_text.getValue();
                        var newval = curval + json.data + "\r\n";
                        pacman_install_log_text.setValue(newval);
                        pacman_install_log_text.getContentElement().scrollToY(100000);
                     }
                     else
                     {
                        // Error message
                        show_server_error();

                        // Return
                        return;
                     }
                  }
               }

               // Get pacman status
               json = server_send({head:{fcode:"pacman",scode:"status"},data:""});
               if(json.head.rcode=="INF")
               {
                  // Set info texts
                  var curval = pacman_install_log_text.getValue();
                  var newval = curval + json.data + "\r\n";
                  pacman_install_log_text.setValue(newval);
                  pacman_install_log_text.getContentElement().scrollToY(100000);
               }
               else
               {
                  // Error message
                  show_server_error();

                  // Return
                  return;
               }
            },this);

            // Uninstall button action
            pacman_uninstall_button.addListener("execute",function()
            {
               // Activate install log page
               pacman_bottom_tabs.setSelection([pacman_install_log_page]);

               // Clear log text
               pacman_install_log_text.setValue("");

               // Loop over selected packages
               for(var i=0;i<pacman_table_data.length;i++)
               {
                  // Check whether package ist selected
                  if(pacman_table_data[i][0])
                  {
                     // Get package name
                     var pacnam = pacman_table_data[i][1];

                     // Install package
                     json = server_send({head:{fcode:"pacman",scode:"remove"},data:pacnam});
                     if(json.head.rcode=="INF")
                     {
                        // Update install log
                        var curval = pacman_install_log_text.getValue();
                        var newval = curval + json.data + "\r\n";
                        pacman_install_log_text.setValue(newval);
                        pacman_install_log_text.getContentElement().scrollToY(100000);
                     }
                     else
                     {
                        // Error message
                        show_server_error();

                        // Return
                        return;
                     }
                  }
               }

               // Get pacman status
               json = server_send({head:{fcode:"pacman",scode:"status"},data:""});
               if(json.head.rcode=="INF")
               {
                  // Set info texts
                  var curval = pacman_install_log_text.getValue();
                  var newval = curval + json.data + "\r\n";
                  pacman_install_log_text.setValue(newval);
                  pacman_install_log_text.getContentElement().scrollToY(100000);
               }
               else
               {
                  // Error message
                  show_server_error();

                  // Return
                  return;
               }
            },this);

            // Update button action
            pacman_update_button.addListener("execute",function()
            {
               // Update package manager
               json = server_send({head:{fcode:"pacman",scode:"update"},data:""});
               if(json.head.rcode=="INF")
               {
                  // Check json.data
                  if(json.data=="0")
                  {
                     qjide_message_box("WARNING",
                                       "Not online",
                                       "You are not connected to the internet.");
                  }
               }
               else
               {
                  // Error message
                  show_server_error();

                  // Return
                  return;
               }

               // Get pacman status
               json = server_send({head:{fcode:"pacman",scode:"status"},data:""});
               if(json.head.rcode=="INF")
               {
                  // Set info texts
                  pacman_install_log_text.setValue(json.data);
               }
               else
               {
                  // Error message
                  show_server_error();

                  // Return
                  return;
               }

               // Activate install log page
               pacman_bottom_tabs.setSelection([pacman_install_log_page]);
            },this);

            // Rebuild button action
            pacman_rebuild_button.addListener("execute",function()
            {
               // Refresh repository
               json = server_send({head:{fcode:"pacman",scode:"refresh"},data:""});
               if(json.head.rcode=="INF")
               {
                  // Do nothing
               }
               else
               {
                  // Error message
                  show_server_error();

                  // Return
                  return;
               }

               // Get pacman status
               json = server_send({head:{fcode:"pacman",scode:"status"},data:""});
               if(json.head.rcode=="INF")
               {
                  // Set info texts
                  pacman_install_log_text.setValue(json.data);
               }
               else
               {
                  // Error message
                  show_server_error();

                  // Return
                  return;
               }

               // Activate install log page
               pacman_bottom_tabs.setSelection([pacman_install_log_page]);
            },this);

            // Goto J wiki
            pacman_wiki_button.addListener("execute",function()
            {
               // Get clicked (selected) row and column
               var row = pacman_package_table.getFocusedRow();
               var col = pacman_package_table.getFocusedColumn();

               // Package name
               var pacnam = "";
               try
               {
                  pacnam = pacman_table_data[row][1];
               }
               catch(err)
               {
                  pacnam = "";
               }

               // Build J wiki url
               var wikiurl = "http://www.jsoftware.com/jwiki";
               if(pacnam!="")
               {
                  wikiurl += "/Addons/" + pacnam;
               }

               // Open window with J wiki url
               window.open(wikiurl,"_new2");
               window.focus();
            },this);

            // Close button action
            pacman_close_button.addListener("execute",function()
            {
               win.close();
               win.destroy();
            },this);

            // Glue it all together ////////////////////////////////////////////

            // Add buttons to container
            pacman_button_cont.add(new qx.ui.core.Spacer(0,3),{row:0,column:3,colSpan:1});
            pacman_button_cont.add(pacman_update_button,      {row:1,column:0,colSpan:1});
            pacman_button_cont.add(pacman_rebuild_button,     {row:1,column:1,colSpan:1});
            pacman_button_cont.add(pacman_wiki_button,        {row:1,column:2,colSpan:1});
            pacman_button_cont.add(pacman_close_button,       {row:1,column:3,colSpan:1});

            // Add widgets to root container
            pacman_root_container.add(pacman_main_split, {edge:"center"});
            pacman_root_container.add(pacman_button_cont,{edge:"south" });

            // Add gui to win
            win.add(pacman_root_container);

            // Add window to root
            root.add(win);

            // Open window
            win.open();
         }

         ///////////////////////////////////////////////////////////////////////
         // Menu bar
         ///////////////////////////////////////////////////////////////////////

         // Create file menu
         var menu_file = new qx.ui.menu.Menu();

         // Create file menu entries ///////////////////////////////////////////

         var menu_file_new_command = new qx.ui.command.Command("Alt+N");
         menu_file_new_command.addListener("execute",function()
         {
            // Get current directory
            var dir = navi_dir_label.getValue();

            // Check whether we are on unix or windows
            if(dir[0]=="/")
            {
               dir = dir + "/";
            }
            else
            {
               dir = dir + "\\";
            }

            // Fire up input box
            qjide_input_box("NEW","New File ...","Name the new file:",dir+"new.ijs");

            // qjide_message_box("INFO","Info","Text<br>Line2<br>Line3<br><b>Hello Kitty</b>");
            // qjide_message_box("WARNING","Warning","Text");
            // qjide_message_box("ERROR","Error","Text");
         },this);

         var menu_file_new = new qx.ui.menu.Button("New","resource/qjide/filenew.png",menu_file_new_command);
         menu_file.add(menu_file_new);

         // Separator //////////////////////////////////////////////////////////

         var menu_file_sep1 = new qx.ui.menu.Separator();
         menu_file.add(menu_file_sep1);

         // Save ///////////////////////////////////////////////////////////////

         var menu_file_save_command = new qx.ui.command.Command("Alt+S");
         menu_file_save_command.addListener("execute",function()
         {
            // Save
            save_current_edit_page();
         },this);

         var menu_file_save = new qx.ui.menu.Button("Save current","resource/qjide/filesave.png",menu_file_save_command);
         menu_file.add(menu_file_save);

         // Save As ////////////////////////////////////////////////////////////

         var menu_file_saveas_command = new qx.ui.command.Command("Alt+A");
         menu_file_saveas_command.addListener("execute",function()
         {
            // File
            var fil = "";

            // Loop over pages
            for(var i=0;i<edit_page_array.length;i++)
            {
               // If it is the active page
               if(edit_tab_view.isSelected(edit_page_array[i].page))
               {
                  // Get file
                  if(edit_page_array[i].path=="")
                  {
                     // Get current directory
                     var dir = navi_dir_label.getValue();

                     // Check whether we are on unix or windows
                     if(dir[0]=="/")
                     {
                        dir = dir + "/";
                     }
                     else
                     {
                        dir = dir + "\\";
                     }

                     // Set path
                     edit_page_array[i].path = dir;
                  }

                  // Set file
                  fil = edit_page_array[i].path + edit_page_array[i].file;

                  // Break loop
                  break;
               }
            }

            // Fire up input box
            qjide_input_box("SAVEAS","Save File As ...","New name of the file:",fil);
         },this);

         var menu_file_saveas = new qx.ui.menu.Button("Save current as ...","resource/qjide/filesaveas.png",menu_file_saveas_command);
         menu_file.add(menu_file_saveas);

         // Save All ///////////////////////////////////////////////////////////

         var menu_file_saveall = new qx.ui.menu.Button("Save all","resource/qjide/filesaveas.png");
         menu_file.add(menu_file_saveall);
         menu_file_saveall.addListener("execute",function(e)
         {
            saveall_edit_pages();
         });

         // Separator //////////////////////////////////////////////////////////

         var menu_file_sep2 = new qx.ui.menu.Separator();
         menu_file.add(menu_file_sep2);

         // Close current //////////////////////////////////////////////////////

         var menu_file_close_current = new qx.ui.menu.Button("Close current","resource/qjide/fileclose.png");
         menu_file.add(menu_file_close_current);
         menu_file_close_current.addListener("execute",function(e)
         {
            close_current_edit_page();
         });

         // Close all but current //////////////////////////////////////////////

         var menu_file_close_allbut = new qx.ui.menu.Button("Close all but current","resource/qjide/fileclose.png");
         menu_file.add(menu_file_close_allbut);
         menu_file_close_allbut.addListener("execute",function(e)
         {
            close_all_but_current_edit_page();
         });

         // Close all //////////////////////////////////////////////////////////

         var menu_file_close_all = new qx.ui.menu.Button("Close all","resource/qjide/fileclose.png");
         menu_file.add(menu_file_close_all);
         menu_file_close_all.addListener("execute",function(e)
         {
            close_all_edit_pages();
         });

         ///////////////////////////////////////////////////////////////////////

         // Create edit menu
         var menu_edit = new qx.ui.menu.Menu();

         // Create edit menu entries

         // Undo ///////////////////////////////////////////////////////////////

         var menu_edit_undo_command = new qx.ui.command.Command("Alt+Z");
         menu_edit_undo_command.addListener("execute",function()
         {
            // Loop over pages
            for(var i=0;i<edit_page_array.length;i++)
            {
               // If it is the active page
               if(edit_tab_view.isSelected(edit_page_array[i].page))
               {
                  // Undo
                  CodeMirror.commands["undo"](edit_page_array[i].text);

                  // Break loop
                  break;
               }
            }
         },this);

         var menu_edit_undo = new qx.ui.menu.Button("Undo","resource/qjide/undo.png",menu_edit_undo_command);
         menu_edit.add(menu_edit_undo);

         // Redo ///////////////////////////////////////////////////////////////

         var menu_edit_redo_command = new qx.ui.command.Command("Shift+Alt+Z");
         menu_edit_redo_command.addListener("execute",function()
         {
            // Loop over pages
            for(var i=0;i<edit_page_array.length;i++)
            {
               // If it is the active page
               if(edit_tab_view.isSelected(edit_page_array[i].page))
               {
                  // Redo
                  CodeMirror.commands["redo"](edit_page_array[i].text);

                  // Break loop
                  break;
               }
            }
         },this);

         var menu_edit_redo = new qx.ui.menu.Button("Redo","resource/qjide/redo.png",menu_edit_redo_command);
         menu_edit.add(menu_edit_redo);

         // Separator //////////////////////////////////////////////////////////

         var menu_edit_sep1 = new qx.ui.menu.Separator();
         menu_edit.add(menu_edit_sep1);

         // Cut ////////////////////////////////////////////////////////////////

         var menu_edit_cut_command = new qx.ui.command.Command("Alt+X");
         menu_edit_cut_command.addListener("execute",function()
         {
            // Disable page select event
            edit_page_event = false;

            // Loop over pages
            for(var i=0;i<edit_page_array.length;i++)
            {
               // If it is the active page
               if(edit_tab_view.isSelected(edit_page_array[i].page))
               {
                  // Get selected text
                  clipboard_buffer = edit_page_array[i].text.getSelection();

                  // Replace selection with empty string (cut)
                  edit_page_array[i].text.replaceSelection("");

                  // Break loop
                  break;
               }
            }

            // Enable page select event
            edit_page_event = true;
         },this);

         var menu_edit_cut = new qx.ui.menu.Button("Cut","resource/qjide/editcut.png",menu_edit_cut_command);
         menu_edit.add(menu_edit_cut);

         // Copy ///////////////////////////////////////////////////////////////

         var menu_edit_copy_command = new qx.ui.command.Command("Alt+C");
         menu_edit_copy_command.addListener("execute",function()
         {
            // Disable page select event
            edit_page_event = false;

            // Loop over pages
            for(var i=0;i<edit_page_array.length;i++)
            {
               // If it is the active page
               if(edit_tab_view.isSelected(edit_page_array[i].page))
               {
                  // Get selected text
                  clipboard_buffer = edit_page_array[i].text.getSelection();

                  // Break loop
                  break;
               }
            }

            // Enable page select event
            edit_page_event = true;
         },this);

         var menu_edit_copy = new qx.ui.menu.Button("Copy","resource/qjide/editcopy.png",menu_edit_copy_command);
         menu_edit.add(menu_edit_copy);

         // Paste //////////////////////////////////////////////////////////////

         var menu_edit_paste_command = new qx.ui.command.Command("Alt+V");
         menu_edit_paste_command.addListener("execute",function()
         {
            // Disable page select event
            edit_page_event = false;

            // Loop over pages
            for(var i=0;i<edit_page_array.length;i++)
            {
               // If it is the active page
               if(edit_tab_view.isSelected(edit_page_array[i].page))
               {
                  // Replace selection with empty string (cut)
                  edit_page_array[i].text.replaceSelection(clipboard_buffer,"end","+input");

                  // Break loop
                  break;
               }
            }

            // Enable page select event
            edit_page_event = true;
         },this);

         var menu_edit_paste = new qx.ui.menu.Button("Paste","resource/qjide/editpaste.png",menu_edit_paste_command);
         menu_edit.add(menu_edit_paste);

         // Separator //////////////////////////////////////////////////////////

         var menu_edit_sep2 = new qx.ui.menu.Separator();
         menu_edit.add(menu_edit_sep2);

         // Find first /////////////////////////////////////////////////////////

         var menu_edit_find_first_command = new qx.ui.command.Command("Alt+F");
         menu_edit_find_first_command.addListener("execute",function()
         {
            // Loop over pages
            for(var i=0;i<edit_page_array.length;i++)
            {
               // If it is the active page
               if(edit_tab_view.isSelected(edit_page_array[i].page))
               {
                  // Find
                  CodeMirror.commands["find"](edit_page_array[i].text);

                  // Break loop
                  break;
               }
            }
         },this);

         var menu_edit_find_first = new qx.ui.menu.Button("Find first ...","resource/qjide/findfirst.png",menu_edit_find_first_command);
         menu_edit.add(menu_edit_find_first);

         // Find next //////////////////////////////////////////////////////////

         var menu_edit_find_next_command = new qx.ui.command.Command("Alt+G");
         menu_edit_find_next_command.addListener("execute",function()
         {
            // Loop over pages
            for(var i=0;i<edit_page_array.length;i++)
            {
               // If it is the active page
               if(edit_tab_view.isSelected(edit_page_array[i].page))
               {
                  // Find next
                  CodeMirror.commands["findNext"](edit_page_array[i].text);

                  // Break loop
                  break;
               }
            }
         },this);

         var menu_edit_find_next = new qx.ui.menu.Button("Find next","resource/qjide/findnext.png",menu_edit_find_next_command);
         menu_edit.add(menu_edit_find_next);

         // Find previous //////////////////////////////////////////////////////

         var menu_edit_find_prev_command = new qx.ui.command.Command("Shift+Alt+G");
         menu_edit_find_prev_command.addListener("execute",function()
         {
            // Loop over pages
            for(var i=0;i<edit_page_array.length;i++)
            {
               // If it is the active page
               if(edit_tab_view.isSelected(edit_page_array[i].page))
               {
                  // Find previous
                  CodeMirror.commands["findPrev"](edit_page_array[i].text);

                  // Break loop
                  break;
               }
            }
         },this);

         var menu_edit_find_prev = new qx.ui.menu.Button("Find previous","resource/qjide/findprev.png",menu_edit_find_prev_command);
         menu_edit.add(menu_edit_find_prev);

         // Separator //////////////////////////////////////////////////////////

         var menu_edit_sep3 = new qx.ui.menu.Separator();
         menu_edit.add(menu_edit_sep3);

         // Replace ////////////////////////////////////////////////////////////

         var menu_edit_replace_command = new qx.ui.command.Command("Alt+R");
         menu_edit_replace_command.addListener("execute",function()
         {
            // Loop over pages
            for(var i=0;i<edit_page_array.length;i++)
            {
               // If it is the active page
               if(edit_tab_view.isSelected(edit_page_array[i].page))
               {
                  // Replace
                  CodeMirror.commands["replace"](edit_page_array[i].text);

                  // Break loop
                  break;
               }
            }
         },this);

         var menu_edit_replace = new qx.ui.menu.Button("Replace ...","resource/qjide/replace.png",menu_edit_replace_command);
         menu_edit.add(menu_edit_replace);

         // Replace all ////////////////////////////////////////////////////////

         var menu_edit_replace_all_command = new qx.ui.command.Command("Shift+Alt+R");
         menu_edit_replace_all_command.addListener("execute",function()
         {
            // Loop over pages
            for(var i=0;i<edit_page_array.length;i++)
            {
               // If it is the active page
               if(edit_tab_view.isSelected(edit_page_array[i].page))
               {
                  // Replace all
                  CodeMirror.commands["replaceAll"](edit_page_array[i].text);

                  // Break loop
                  break;
               }
            }
         },this);

         var menu_edit_replace_all = new qx.ui.menu.Button("Replace all ...","resource/qjide/replace.png",menu_edit_replace_all_command);
         menu_edit.add(menu_edit_replace_all);

         ///////////////////////////////////////////////////////////////////////

         // Create view menu
         var menu_view = new qx.ui.menu.Menu();

         // Create view menu entries

         // Toggle line numbers ////////////////////////////////////////////////

         var menu_view_toggle_line = new qx.ui.menu.Button("Toggle Line Numbers","resource/qjide/lines.png");
         menu_view.add(menu_view_toggle_line);
         menu_view_toggle_line.addListener("execute",function(e)
         {
            // Loop over pages
            for(var i=0;i<edit_page_array.length;i++)
            {
               // If it is the active page
               if(edit_tab_view.isSelected(edit_page_array[i].page))
               {
                  // Line numbers
                  edit_page_array[i].text.setOption("lineNumbers",!edit_page_array[i].text.getOption("lineNumbers"));

                  // Break loop
                  break;
               }
            }
         });

         // Toggle line wrap ///////////////////////////////////////////////////

         var menu_view_toggle_wrap = new qx.ui.menu.Button("Toggle Line Wrapping","resource/qjide/wrapping.png");
         menu_view.add(menu_view_toggle_wrap);
         menu_view_toggle_wrap.addListener("execute",function(e)
         {
            // Loop over pages
            for(var i=0;i<edit_page_array.length;i++)
            {
               // If it is the active page
               if(edit_tab_view.isSelected(edit_page_array[i].page))
               {
                  // Line numbers
                  edit_page_array[i].text.setOption("lineWrapping",!edit_page_array[i].text.getOption("lineWrapping"));

                  // Break loop
                  break;
               }
            }
         });

         // Separator //////////////////////////////////////////////////////////

         var menu_view_sep1 = new qx.ui.menu.Separator();
         menu_view.add(menu_view_sep1);

         // Clear terminal /////////////////////////////////////////////////////

         var menu_view_clear_terminal = new qx.ui.menu.Button("Clear Terminal","resource/qjide/clearterm.png");
         menu_view.add(menu_view_clear_terminal);
         menu_view_clear_terminal.addListener("execute",function(e)
         {
            edit_term_area.setValue("   ");
            edit_term_area.setTextSelection(edit_term_area.getValue().length);
         });

         // Separator //////////////////////////////////////////////////////////

         var menu_view_sep2 = new qx.ui.menu.Separator();
         menu_view.add(menu_view_sep2);

         // Toggle splitter ////////////////////////////////////////////////////

         var menu_view_toggle_split_command = new qx.ui.command.Command("Alt+O");
         menu_view_toggle_split_command.addListener("execute",function()
         {
            // Toggle splitter
            if(edit_split.getOrientation()=="vertical")
            {
               edit_split.setOrientation("horizontal");
               edit_term_split.setOrientation("vertical");
            }
            else
            {
               edit_split.setOrientation("vertical");
               edit_term_split.setOrientation("horizontal");
            }
         },this);

         var menu_view_toggle_split = new qx.ui.menu.Button("Toggle Splitter","resource/qjide/split.png",menu_view_toggle_split_command);
         menu_view.add(menu_view_toggle_split);

         // Toggle plot window /////////////////////////////////////////////////

         var menu_view_toggle_plot_command = new qx.ui.command.Command("Alt+P");
         menu_view_toggle_plot_command.addListener("execute",function()
         {
            // Toggle plot window
            if(plot_view_cont.isExcluded())
            {
               term_view_cont.show();
               plot_view_cont.show();
            }
            else
            {
               term_view_cont.show();
               plot_view_cont.exclude();
            }
         },this);

         var menu_view_toggle_plot = new qx.ui.menu.Button("Toggle Plot Window","resource/qjide/plot.png",menu_view_toggle_plot_command);
         menu_view.add(menu_view_toggle_plot);

         ///////////////////////////////////////////////////////////////////////

         // Create run menu
         var menu_run = new qx.ui.menu.Menu();

         // Create run menu entries

         var menu_run_script_command = new qx.ui.command.Command("Alt+L");
         menu_run_script_command.addListener("execute",function()
         {
            // File
            var fil = "";

            // Loop over pages
            for(var i=0;i<edit_page_array.length;i++)
            {
               // If it is the active page
               if(edit_tab_view.isSelected(edit_page_array[i].page))
               {
                  // Don't run if its dirt(y)
                  if(edit_page_array[i].dirt)
                  {
                     // Save before run
                     qjide_message_box("WARNING","Warning","Please save file, before loading it.");

                     // Return
                     return;
                  }

                  // Get file
                  fil = edit_page_array[i].path + edit_page_array[i].file;

                  // Break loop
                  break;
               }
            }

            // Command line
            var lin = "load \'" + fil + "\'";
            var val = "";
            var out = "";

            // Update terminal
            var tex = "";
            tex = edit_term_area.getValue();
            tex = tex + lin + "\r\n";
            edit_term_area.setValue(tex);

            // Do some formatting for transfer
            lin = lin.replace(/\\/g,"\\\\");
            lin = lin.replace(/\"/g,"\\\"");
            lin = encodeURIComponent(lin);

            // Send command line
            json = server_send({head:{fcode:"term",scode:"send"},data:lin});
            if(json.head.rcode=="INF")
            {
               // Do nothing
            }
            else
            {
               // Error message
               show_server_error();

               // Return
               return;
            }

            // Receive terminal output
            receive_terminal_output();
         },this);

         var menu_run_script = new qx.ui.menu.Button("Load current script","resource/qjide/runexec.png",menu_run_script_command);
         menu_run.add(menu_run_script);

         ///////////////////////////////////////////////////////////////////////

         // Create tools menu
         var menu_tools = new qx.ui.menu.Menu();

         // Create tools menu entries

         var menu_tools_pacman = new qx.ui.menu.Button("Package Manager","resource/qjide/pacman.png");
         menu_tools.add(menu_tools_pacman);
         menu_tools_pacman.addListener("execute",function(e)
         {
            qjide_package_manager();
         });

         ///////////////////////////////////////////////////////////////////////

         // Create help menu
         var menu_help = new qx.ui.menu.Menu();

         // Create help menu entries

         var menu_help_voc = new qx.ui.menu.Button("Vocabulary","resource/qjide/helpvoc.png");
         menu_help.add(menu_help_voc);
         menu_help_voc.addListener("execute",function(e)
         {
            // Send command line
            json = server_send({head:{fcode:"url",scode:"help"},data:""});
            if(json.head.rcode=="INF")
            {
               // Open help window/tab
               window.open(json.data,"_new1");
               window.focus();
            }
            else
            {
               // Error message
               show_server_error();

               // Return
               return;
            }
         });

         ///////////////////////////////////////////////////////////////////////

         var menu_help_sep1 = new qx.ui.menu.Separator();
         menu_help.add(menu_help_sep1);

         ///////////////////////////////////////////////////////////////////////

         var menu_help_lab_select = new qx.ui.menu.Button("Lab select ...","resource/qjide/labselect.png");
         menu_help.add(menu_help_lab_select);
         menu_help_lab_select.addListener("execute",function(e)
         {
            qjide_lab_selector();
         });

         ///////////////////////////////////////////////////////////////////////

         var menu_help_lab_advance_command = new qx.ui.command.Command("Alt+J");
         menu_help_lab_advance_command.addListener("execute",function()
         {
            // Advance lab
            json = server_send({head:{fcode:"labs",scode:"advance"},data:""});
            if(json.head.rcode=="INF")
            {
               // Do nothing
            }
            else
            {
               // Error message
               show_server_error();

               // Return
               return;
            }

            // Receive terminal output
            receive_terminal_output();
         },this);

         var menu_help_lab_advance = new qx.ui.menu.Button("Lab advance","resource/qjide/labadvance.png",menu_help_lab_advance_command);
         menu_help.add(menu_help_lab_advance);

         ///////////////////////////////////////////////////////////////////////

         var menu_help_lab_end = new qx.ui.menu.Button("Lab end","resource/qjide/labend.png");
         menu_help.add(menu_help_lab_end);
         menu_help_lab_end.addListener("execute",function(e)
         {
            // Halt lab
            json = server_send({head:{fcode:"labs",scode:"stop"},data:""});
            if(json.head.rcode=="INF")
            {
               // Do nothing
            }
            else
            {
               // Error message
               show_server_error();

               // Return
               return;
            }

            // Receive terminal output
            receive_terminal_output();
         });

         ///////////////////////////////////////////////////////////////////////

         var menu_help_sep2 = new qx.ui.menu.Separator();
         menu_help.add(menu_help_sep2);

         ///////////////////////////////////////////////////////////////////////

         var menu_help_about = new qx.ui.menu.Button("About ...","resource/qjide/helpabout.png");
         menu_help.add(menu_help_about);
         menu_help_about.addListener("execute",function(e)
         {
            qjide_message_box("INFO","About",
                              "<br>" +
                              "<b>J Browser IDE&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Version 2.2.0<br><br>" +
                              "Copyright (c) 2013-2016 Martin Saurer<br><br>" +
                              "Released under the GPL3 License (see gpl3.txt)</b>");
         });

         ///////////////////////////////////////////////////////////////////////

         // Create menu frame
         var menu_frame = new qx.ui.container.Composite(new qx.ui.layout.Dock());
         menu_frame.setDecorator("menubar");

         // Create menu bar
         var menu_bar = new qx.ui.menubar.MenuBar();
         menu_bar.setDecorator(null);
         menu_frame.add(menu_bar,{edge:"center"});

         // Create title bar label
         var title_lab = new qx.ui.basic.Label("<b>Browser IDE&nbsp;&nbsp;</b>");
         title_lab.setTextColor("#000000");
         title_lab.setAlignY("middle");
         title_lab.setRich(true);

         // Create spacer
         var title_spc = new qx.ui.basic.Label("&nbsp;&nbsp;");
         title_spc.setRich(true);

         // Create title bar image
         var title_img = new qx.ui.basic.Image("resource/qjide/jred.png");
         title_img.setAlignY("middle");

         // Create title bar in menu frame
         menu_frame.add(title_lab,{edge:"east"});
         menu_frame.add(title_spc,{edge:"east"});
         menu_frame.add(title_img,{edge:"east"});

         // Create file menu (button)
         var menu_file_layout = new qx.ui.menubar.Button("File",null,menu_file);
         menu_bar.add(menu_file_layout);

         // Create edit menu (button)
         var menu_edit_layout = new qx.ui.menubar.Button("Edit",null,menu_edit);
         menu_bar.add(menu_edit_layout);

         // Create view menu (button)
         var menu_view_layout = new qx.ui.menubar.Button("View",null,menu_view);
         menu_bar.add(menu_view_layout);

         // Create run menu (button)
         var menu_run_layout = new qx.ui.menubar.Button("Run",null,menu_run);
         menu_bar.add(menu_run_layout);

         // Create tools menu (button)
         var menu_tools_layout = new qx.ui.menubar.Button("Tools",null,menu_tools);
         menu_bar.add(menu_tools_layout);

         // Create help menu (button)
         var menu_help_layout = new qx.ui.menubar.Button("Help",null,menu_help);
         menu_bar.add(menu_help_layout);

         ///////////////////////////////////////////////////////////////////////
         // Layout
         ///////////////////////////////////////////////////////////////////////

         // Create main splitter
         var main_split     = new qx.ui.splitpane.Pane("horizontal");
         var navi_main_cont = new qx.ui.container.Composite(new qx.ui.layout.Grow());
         var edit_main_cont = new qx.ui.container.Composite(new qx.ui.layout.Grow());

         // Add split areas 1:4
         main_split.add(navi_main_cont,1);
         main_split.add(edit_main_cont,4);

         // Split edit area
         var edit_split     = new qx.ui.splitpane.Pane("vertical");
         var edit_file_cont = new qx.ui.container.Composite(new qx.ui.layout.Grow());
         var edit_term_cont = new qx.ui.container.Composite(new qx.ui.layout.Grow());

         // Add pre-select and select-detail areas with a size relation of 1:3
         edit_split.add(edit_file_cont,1);
         edit_split.add(edit_term_cont,1);

         // Crrate term splitter and containers
         var edit_term_split = new qx.ui.splitpane.Pane("horizontal");
         var term_view_cont  = new qx.ui.container.Composite(new qx.ui.layout.Grow());
         var plot_view_cont  = new qx.ui.container.Composite(new qx.ui.layout.Grow());

         // Exclude plot view by default
         plot_view_cont.exclude();

         // Add view and plot container to term splitter
         edit_term_split.add(term_view_cont,1);
         edit_term_split.add(plot_view_cont,1);

         // Add term splitter to term container
         edit_term_cont.add(edit_term_split);

         // Add edit split to edit container
         edit_main_cont.add(edit_split);

         ///////////////////////////////////////////////////////////////////////
         // Navigation area
         ///////////////////////////////////////////////////////////////////////

         // Create tab view
         var navi_tab_view = new qx.ui.tabview.TabView("top");
         navi_tab_view.setBackgroundColor("#afafaf");
         navi_tab_view.setContentPadding(4,4,4,4);

         // Create file page
         var navi_file_page = new qx.ui.tabview.Page("Files","resource/qjide/navifile.png");
         navi_file_page.setLayout(new qx.ui.layout.Dock());
         navi_file_page.setBackgroundColor("#fcfcdd");

         // Create path label on file page
         var navi_dir_label = new qx.ui.form.TextField("");
         navi_dir_label.setReadOnly(true);
         navi_file_page.add(navi_dir_label,{edge:"north"});

         // Add spacer
         navi_file_page.add(new qx.ui.core.Spacer(0,4),{edge:"north"});

         // Create home button on file page
         var navi_home_button = new qx.ui.form.Button("Home / user","resource/qjide/home.png");
         navi_home_button.addListener("execute",function(e)
         {
            // Get file or directory contents
            json = server_send({head:{fcode:"navi",scode:"home"},data:""});
            if(json.head.rcode=="INF")
            {
               // Check whether file or directory
               if(json.head.rmesg=="DIR")
               {
                  navi_dir_label.setValue(json.data.path);
                  navi_dir_label.getContentElement().scrollToX(1000);
                  navi_file_tree_fill(json.data.files);
               }
            }
            else
            {
               // Error message
               show_server_error();

               // Return
               return;
            }
         },this);
         navi_file_page.add(navi_home_button,{edge:"north"});

         // Add spacer
         navi_file_page.add(new qx.ui.core.Spacer(0,4),{edge:"north"});

         // File list on file page
         var navi_file_tree = new qx.ui.tree.Tree();
         navi_file_page.add(navi_file_tree,{edge:"center"});

         // Add double click listener
         navi_file_tree.addListener("dblclick",function(e)
         {
            // Get selected file or directory
            var fil = navi_file_tree.getSelection()[0].getLabel();

            // Get file or directory contents
            json = server_send({head:{fcode:"navi",scode:"goto"},data:fil});
            if(json.head.rcode=="INF")
            {
               // Check whether file or directory
               if(json.head.rmesg=="DIR")
               {
                  navi_dir_label.setValue(json.data.path);
                  navi_dir_label.getContentElement().scrollToX(1000);
                  navi_file_tree_fill(json.data.files);
               }
               else
               {
                  // Get file and text
                  var fil = json.data.file;
                  var tex = json.data.text;

                  // Add edit page
                  add_edit_page(fil,tex);
               }
            }
            else
            {
               // Error message
               show_server_error();

               // Return
               return;
            }
         },this);

         // Function to fill the tree
         function navi_file_tree_fill(f)
         {
            // Add new root item
            var navi_file_root = new qx.ui.tree.TreeFolder("Root");
            navi_file_tree.setRoot(navi_file_root);

            // Add up (..) node
            var tn = new qx.ui.tree.TreeFile("..");
            tn.setIcon("resource/qjide/navifolder.png");
            navi_file_root.add(tn);

            // Loop over file array (parameter f)
            for(var i=0;i<f.length;i++)
            {
               // Check directory or file
               var dir = false;
               var ijs = false;
               var fil = "";
               if(f[i][f[i].length-1]=="/")
               {
                  dir = true;
               }
               if(dir)
               {
                  fil = f[i].substr(0,f[i].length-1);
               }
               else
               {
                  fil = f[i];
                  if(fil.substr(fil.length-4).toLowerCase()==".ijs")
                  {
                     ijs = true;
                  }
               }

               // Add tree node
               tn = new qx.ui.tree.TreeFile(fil);
               if(ijs)
               {
                  tn.setIcon("resource/qjide/jblue.png");
               }
               else if(dir)
               {
                  tn.setIcon("resource/qjide/navifolder.png");
               }
               else
               {
                  tn.setIcon("resource/qjide/navifile.png");
               }
               navi_file_root.add(tn);
            }

            // Hide root
            navi_file_tree.setHideRoot(true);

            // Open root
            navi_file_root.setOpen(true);
         }

         ///////////////////////////////////////////////////////////////////////

         // Showing locales or defs
         var navi_shows_locales = true;

         // Create defs page
         var navi_defs_page = new qx.ui.tabview.Page("Verbs","resource/qjide/viewer.png");
         navi_defs_page.setLayout(new qx.ui.layout.Dock());
         navi_defs_page.setBackgroundColor("#ccffff");

         // Create locale label on defs page
         var navi_locale_label = new qx.ui.form.TextField("");
         navi_locale_label.setReadOnly(true);
         navi_defs_page.add(navi_locale_label,{edge:"north"});

         // Add spacer
         navi_defs_page.add(new qx.ui.core.Spacer(0,4),{edge:"north"});

         // Create refresh button on defs page
         var navi_base_button = new qx.ui.form.Button("Refresh / locales","resource/qjide/locale.png");
         navi_base_button.addListener("execute",function(e)
         {
            // Get locales
            json = server_send({head:{fcode:"navi",scode:"locales"},data:""});
            if(json.head.rcode=="INF")
            {
               // Check whether file or directory
               if(json.head.rmesg=="LOC")
               {
                  navi_locale_label.setValue("<All Locales>");
                  navi_shows_locales = true;
                  navi_defs_tree_fill(json.data,true);
               }
            }
            else
            {
               // Error message
               show_server_error();

               // Return
               return;
            }
         },this);
         navi_defs_page.add(navi_base_button,{edge:"north"});

         // Add spacer
         navi_defs_page.add(new qx.ui.core.Spacer(0,4),{edge:"north"});

         // Defs list on defs page
         var navi_defs_tree = new qx.ui.tree.Tree();
         navi_defs_page.add(navi_defs_tree,{edge:"center"});

         // Add double click listener
         navi_defs_tree.addListener("dblclick",function(e)
         {
            // Get selected file or directory
            var nam = navi_defs_tree.getSelection()[0].getLabel();

            // Check navi shows locales
            if(navi_shows_locales)
            {
               // Get defs in locale
               json = server_send({head:{fcode:"navi",scode:"defs"},data:nam});
               if(json.head.rcode=="INF")
               {
                  // Check whether file or directory
                  if(json.head.rmesg=="DEF")
                  {
                     navi_locale_label.setValue("Locale: " + nam);
                     navi_defs_tree_fill(json.data,false);
                  }
               }
               else
               {
                  // Error message
                  show_server_error();

                  // Return
                  return;
               }
            }
            else
            {
               // Patch nam with locale
               nam = nam + "_" + navi_locale_label.getValue().substr(8) + "_";

               // Get source of given definition
               json = server_send({head:{fcode:"navi",scode:"source"},data:nam});
               if(json.head.rcode=="INF")
               {
                  // Check whether file or directory
                  if(json.head.rmesg=="SRC")
                  {
                     // Set view area value
                     edit_view_area.setValue(nam + " =: " + json.data);
                     term_tab_view.setSelection([edit_view_page]);
                  }
               }
               else
               {
                  // Error message
                  show_server_error();

                  // Return
                  return;
               }

               // Get script of given definition
               json = server_send({head:{fcode:"navi",scode:"script"},data:nam});
               if(json.head.rcode=="INF")
               {
                  // Check whether file or directory
                  edit_view_edit_button.setLabel("Edit script: " + json.data);
               }
               else
               {
                  // Error message
                  show_server_error();

                  // Return
                  return;
               }
            }

            // Locales or defs
            if(navi_shows_locales) navi_shows_locales = false;

         },this);

         // Function to fill the tree
         function navi_defs_tree_fill(f,l)
         {
            // Define icon
            var icon = "resource/qjide/viewer.png";
            if(l) icon = "resource/qjide/locale.png";

            // Add new root item
            var navi_defs_root = new qx.ui.tree.TreeFolder("Root");
            navi_defs_tree.setRoot(navi_defs_root);

            // Loop over array (parameter f)
            for(var i=0;i<f.length;i++)
            {
               // Add tree node
               var tn = new qx.ui.tree.TreeFile(f[i]);
               tn.setIcon(icon);
               navi_defs_root.add(tn);
               if(i==0)
               {
                  navi_defs_tree.setSelection([tn]);
               }
            }

            // Hide root
            navi_defs_tree.setHideRoot(true);

            // Open root
            navi_defs_root.setOpen(true);
         }

         // Add pages to tab view
         navi_tab_view.add(navi_file_page);
         navi_tab_view.add(navi_defs_page);

         // Add tab view to navi container
         navi_main_cont.add(navi_tab_view);

         ///////////////////////////////////////////////////////////////////////
         // Edit area
         ///////////////////////////////////////////////////////////////////////

         // Create tab view
         var edit_tab_view = new qx.ui.tabview.TabView("top");
         edit_tab_view.setBackgroundColor("#afafaf");
         edit_tab_view.setContentPadding(0,0,0,0);

         // Add tab view to navi container
         edit_file_cont.add(edit_tab_view);

         // Tab change selection listener
         edit_tab_view.addListener("changeSelection",function(e)
         {
            // Check edit page event
            if(edit_page_event)
            {
               qx.event.Timer.once(function()
               {
                  // Loop over pages
                  for(var i=0;i<edit_page_array.length;i++)
                  {
                     // Is it the selected page
                     if(edit_tab_view.isSelected(edit_page_array[i].page))
                     {
                        // Check for undefined
                        if(edit_page_array[i].text!=undefined)
                        {
                           // Set focus to text area
                           edit_page_array[i].text.focus();
                        }
                     }
                  }
               },this,100);
            }
            else
            {
               // Ignore event
               e.preventDefault();
            }
         },this);

         // Tab view resize listener
         edit_tab_view.addListener("resize",function(e)
         {
            for(var i=0;i<edit_page_array.length;i++)
            {
               try
               {
                  edit_page_array[i].text.setSize(edit_page_array[i].page.getInnerSize().width,edit_page_array[i].page.getInnerSize().height);
               }
               catch(err)
               {
               }
            }
         },this);

         // Function to add a page
         function add_edit_page(f,t)
         {
            // Disable page select event
            edit_page_event = false;

            // Index variable
            var idx = 0;
            var fnd = false;

            // Split given file into file and path
            var fil = "";
            var pth = "";
            var pos = f.lastIndexOf("\\");
            if(pos<0)
            {
               pos = f.lastIndexOf("/");
            }
            if(pos>0)
            {
               pth = f.substr(0,pos+1);
               fil = f.substr(pos+1);
            }
            else
            {
               fil = f;
            }

            // Check whether the given file is already open
            fnd = false;
            for(idx=0;idx<edit_page_array.length;idx++)
            {
               if((edit_page_array[idx].path+edit_page_array[idx].file)==(pth+fil))
               {
                  fnd = true;
                  break;
               }
            }

            // File found ?
            if(!fnd)
            {
               // Get length of page array as new index
               idx = edit_page_array.length;

               // Create empty page array object
               edit_page_array[idx] = new Object();

               // Set file
               edit_page_array[idx].path = pth;
               edit_page_array[idx].file = fil;
               edit_page_array[idx].dirt = false;

               // Which icon for page ?
               var ico = "resource/qjide/navifile.png";
               if(fil.substr(fil.length-4).toLowerCase()==".ijs")
               {
                  ico = "resource/qjide/jblue.png";
               }

               // Create file page
               edit_page_array[idx].page = new qx.ui.tabview.Page(fil,ico);
               edit_page_array[idx].page.setLayout(new qx.ui.layout.Grow());

               // Add pages to tab view
               edit_tab_view.add(edit_page_array[idx].page);

               // Create text area
               edit_page_array[idx].text = new qx.ui.form.TextArea();
               edit_page_array[idx].text.setFont(edit_text_font);
               edit_page_array[idx].text.setDecorator(null);
               edit_page_array[idx].text.setBackgroundColor("#fcfcdd");
               edit_page_array[idx].text.setTextColor("#0000ff");
               edit_page_array[idx].text.setNativeContextMenu(true);

               // Here we add CodeMirror
               edit_page_array[idx].text.addListenerOnce("appear",function(e)
               {
                  edit_page_array[idx].text =
                     new CodeMirror.fromTextArea(edit_page_array[idx].text.getContentElement().getDomElement(),
                        {
                           mode:         "j",
                           lineNumbers:  false,
                           lineWrapping: false,
                           tabSize:      0,
                           gutter:       false,
                           // We disable some pre-defined shortcuts
                           extraKeys:
                           {
                              // PC keyboard
                              "Ctrl-F":       function(cm) { },
                              "Ctrl-G":       function(cm) { },
                              "Shift-Ctrl-G": function(cm) { },
                              "Shift-Ctrl-F": function(cm) { },
                              "Shift-Ctrl-R": function(cm) { },

                              // Mac keyboard
                              "Cmd-F":           function(cm) { },
                              "Cmd-G":           function(cm) { },
                              "Shift-Cmd-G":     function(cm) { },
                              "Cmd-Alt-F":       function(cm) { },
                              "Shift-Cmd-Alt-F": function(cm) { }
                           }
                        }
                     );
                  edit_page_array[idx].text.on("change",function(ins,obj)
                  {
                     // Loop over pages
                     for(var i=0;i<edit_page_array.length;i++)
                     {
                        // If it is the active page
                        if(edit_tab_view.isSelected(edit_page_array[i].page))
                        {
                           // Check dirt(y) flag
                           if(edit_page_array[i].dirt==false)
                           {
                              edit_page_array[i].dirt = true;
                              edit_page_array[i].page.setLabel(edit_page_array[i].file+"*");
                           }

                           // Break loop
                           break;
                        }
                     }
                  });
                  edit_page_array[idx].text.setSize(edit_page_array[idx].page.getInnerSize().width,edit_page_array[idx].page.getInnerSize().height);
               },this);

               // Set focus to text area
               qx.event.Timer.once(function()
               {
                  // Loop over pages
                  for(var i=0;i<edit_page_array.length;i++)
                  {
                     // Is it the selected page
                     if(edit_tab_view.isSelected(edit_page_array[i].page))
                     {
                        // Check for undefined
                        if(edit_page_array[i].text!=undefined)
                        {
                           // Set focus to text area
                           edit_page_array[i].text.focus();
                        }
                     }
                  }
               },this,100);

               // Handle keypress to set dirt(y) flag
               /*
               edit_page_array[idx].text.addListener("input",function(e)
               {
                  // Loop over pages
                  for(var i=0;i<edit_page_array.length;i++)
                  {
                     // If it is the active page
                     if(edit_tab_view.isSelected(edit_page_array[i].page))
                     {
                        // Check dirt(y) flag
                        if(edit_page_array[i].dirt==false)
                        {
                           edit_page_array[i].dirt = true;
                           edit_page_array[i].page.setLabel(edit_page_array[i].file+"*");
                        }

                        // Break loop
                        break;
                     }
                  }
               },this);
               */

               // Set contents of text area
               edit_page_array[idx].text.setValue(t);

               // Add text area to tab page
               edit_page_array[idx].page.add(edit_page_array[idx].text);
            }

            // Enable page select event
            edit_page_event = true;

            // Make added page the selected one
            edit_tab_view.setSelection([edit_page_array[idx].page]);
         }

         // Function to save current page
         function save_current_edit_page()
         {
            // Disable page select event
            edit_page_event = false;

            // Loop over pages
            for(var i=0;i<edit_page_array.length;i++)
            {
               // If it is the active page
               if(edit_tab_view.isSelected(edit_page_array[i].page))
               {
                  // Check dirt(y) flag
                  if(edit_page_array[i].dirt)
                  {
                     // Get file
                     if(edit_page_array[i].path=="")
                     {
                        // Get current directory
                        var dir = navi_dir_label.getValue();

                        // Check whether we are on unix or windows
                        if(dir[0]=="/")
                        {
                           dir = dir + "/";
                        }
                        else
                        {
                           dir = dir + "\\";
                        }

                        // Set path
                        edit_page_array[i].path = dir;
                     }

                     // File and text
                     var fil = edit_page_array[i].path + edit_page_array[i].file;
                     var tex = edit_page_array[i].text.getValue();

                     // Do some formatting for transfer
                     fil = fil.replace(/\\/g,"\\\\");
                     fil = fil.replace(/\"/g,"\\\"");
                     fil = encodeURIComponent(fil);
                     tex = tex.replace(/\\/g,"\\\\");
                     tex = tex.replace(/\"/g,"\\\"");
                     tex = tex.replace(/\r/g,"\\r");
                     tex = tex.replace(/\n/g,"\\n");
                     tex = tex.replace(/\t/g,"\\t");
                     tex = encodeURIComponent(tex);

                     // Save file
                     json = server_send({head:{fcode:"file",scode:"save"},data:{file:fil,text:tex}});
                     if(json.head.rcode=="INF")
                     {
                        // Set dirt(y) flag and page label
                        edit_page_array[i].dirt = false;
                        edit_page_array[i].page.setLabel(edit_page_array[i].file);
                     }
                     else
                     {
                        // Error message
                        show_server_error();

                        // Return
                        return;
                     }
                  }

                  // Break loop
                  break;
               }
            }

            // Enable page select event
            edit_page_event = true;
         }

         // Function to save current page
         function saveas_current_edit_page(f)
         {
            // Disable page select event
            edit_page_event = false;

            // Loop over pages
            for(var i=0;i<edit_page_array.length;i++)
            {
               // If it is the active page
               if(edit_tab_view.isSelected(edit_page_array[i].page))
               {
                  // Split given file into file and path
                  var fil = "";
                  var pth = "";
                  var pos = f.lastIndexOf("\\");
                  if(pos<0)
                  {
                     pos = f.lastIndexOf("/");
                  }
                  if(pos>0)
                  {
                     pth = f.substr(0,pos+1);
                     fil = f.substr(pos+1);
                  }
                  else
                  {
                     fil = f;
                  }

                  // Set file
                  edit_page_array[i].path = pth;
                  edit_page_array[i].file = fil;

                  // File and text
                  var fil = edit_page_array[i].path + edit_page_array[i].file;
                  var tex = edit_page_array[i].text.getValue();

                  // Do some formatting for transfer
                  fil = fil.replace(/\\/g,"\\\\");
                  fil = fil.replace(/\"/g,"\\\"");
                  fil = encodeURIComponent(fil);
                  tex = tex.replace(/\\/g,"\\\\");
                  tex = tex.replace(/\"/g,"\\\"");
                  tex = tex.replace(/\r/g,"\\r");
                  tex = tex.replace(/\n/g,"\\n");
                  tex = encodeURIComponent(tex);

                  // Save file
                  json = server_send({head:{fcode:"file",scode:"save"},data:{file:fil,text:tex}});
                  if(json.head.rcode=="INF")
                  {
                     // Which icon for page ?
                     var ico = "resource/qjide/navifile.png";
                     if(fil.substr(fil.length-4).toLowerCase()==".ijs")
                     {
                        ico = "resource/qjide/jblue.png";
                     }
                     edit_page_array[i].page.setIcon(ico);

                     // Set dirt(y) flag and page label
                     edit_page_array[i].dirt = false;
                     edit_page_array[i].page.setLabel(edit_page_array[i].file);
                  }
                  else
                  {
                     // Error message
                     show_server_error();

                     // Return
                     return;
                  }

                  // Break loop
                  break;
               }
            }

            // Enable page select event
            edit_page_event = true;
         }

         // Function to save all edit pages
         function saveall_edit_pages()
         {
            // Disable page select event
            edit_page_event = false;

            // Loop over pages
            for(var i=0;i<edit_page_array.length;i++)
            {
               // Check dirt(y) flag
               if(edit_page_array[i].dirt)
               {
                  // Get file
                  if(edit_page_array[i].path=="")
                  {
                     // Get current directory
                     var dir = navi_dir_label.getValue();

                     // Check whether we are on unix or windows
                     if(dir[0]=="/")
                     {
                        dir = dir + "/";
                     }
                     else
                     {
                        dir = dir + "\\";
                     }

                     // Set path
                     edit_page_array[i].path = dir;
                  }

                  // File and text
                  var fil = edit_page_array[i].path + edit_page_array[i].file;
                  var tex = edit_page_array[i].text.getValue();

                  // Do some formatting for transfer
                  fil = fil.replace(/\\/g,"\\\\");
                  fil = fil.replace(/\"/g,"\\\"");
                  fil = encodeURIComponent(fil);
                  tex = tex.replace(/\\/g,"\\\\");
                  tex = tex.replace(/\"/g,"\\\"");
                  tex = tex.replace(/\r/g,"\\r");
                  tex = tex.replace(/\n/g,"\\n");
                  tex = encodeURIComponent(tex);

                  // Save file
                  json = server_send({head:{fcode:"file",scode:"save"},data:{file:fil,text:tex}});
                  if(json.head.rcode=="INF")
                  {
                     // Set dirt(y) flag and page label
                     edit_page_array[i].dirt = false;
                     edit_page_array[i].page.setLabel(edit_page_array[i].file);
                  }
                  else
                  {
                     // Error message
                     show_server_error();

                     // Return
                     return;
                  }
               }
            }
         }

         // Function to close current page
         function close_current_edit_page()
         {
            // Disable page select event
            edit_page_event = false;

            // Loop over pages
            for(var i=0;i<edit_page_array.length;i++)
            {
               // If it is the active page
               if(edit_tab_view.isSelected(edit_page_array[i].page))
               {
                  // Check dirt(y) flag
                  if(edit_page_array[i].dirt)
                  {
                     //qjide_message_box("WARNING","Warning","Please save file, before close!");
                     qjide_yesno_box("DISCARD","Discard file ?","Current file has not been saved.<br><br>Discard ?");
                  }
                  else
                  {
                     // Remove page from tab view
                     edit_tab_view.remove(edit_page_array[i].page);

                     // Remove page from pages array
                     edit_page_array.splice(i,1);
                  }

                  // Break loop
                  break;
               }
            }

            // Enable page select event
            edit_page_event = true;
         }

         // Function to discard current page
         function discard_current_edit_page()
         {
            // Disable page select event
            edit_page_event = false;

            // Loop over pages
            for(var i=0;i<edit_page_array.length;i++)
            {
               // If it is the active page
               if(edit_tab_view.isSelected(edit_page_array[i].page))
               {
                  // Remove page from tab view
                  edit_tab_view.remove(edit_page_array[i].page);

                  // Remove page from pages array
                  edit_page_array.splice(i,1);

                  // Break loop
                  break;
               }
            }

            // Enable page select event
            edit_page_event = true;
         }

         // Function to close all but current page
         function close_all_but_current_edit_page()
         {
            // Disable page select event
            edit_page_event = false;

            // Dirty
            var dirty = 0;

            // Loop over pages
            for(var i=0;i<edit_page_array.length;i++)
            {
               // If it is the active page
               if(!edit_tab_view.isSelected(edit_page_array[i].page))
               {
                  if(edit_page_array[i].dirt)
                  {
                     dirty += 1;
                  }
               }
            }

            // Message
            if(dirty>0)
            {
               // Message box
               qjide_message_box("WARNING","Warning","One or more files ar not saved.<br><br>Please save them, before close!");

               // Return
               return;
            }

            // Loop over pages
            for(var i=0;i<edit_page_array.length;i++)
            {
               // If it is the active page
               if(!edit_tab_view.isSelected(edit_page_array[i].page))
               {
                  // Remove page from tab view
                  edit_tab_view.remove(edit_page_array[i].page);

                  // Empty file field
                  edit_page_array[i].file = "";
               }
            }

            // Remove page from pages array
            var temp_array = [];
            for(var i=0;i<edit_page_array.length;i++)
            {
               if(edit_page_array[i].file!="")
               {
                  temp_array[temp_array.length] = edit_page_array[i];
               }
            }
            edit_page_array = [];
            for(var i=0;i<temp_array.length;i++)
            {
               edit_page_array[edit_page_array.length] = temp_array[i];
            }

            // Enable page select event
            edit_page_event = true;
         }

         // Function to close all edit pages
         function close_all_edit_pages()
         {
            // Disable page select event
            edit_page_event = false;

            // Dirty
            var dirty = 0;

            // Loop over pages
            for(var i=0;i<edit_page_array.length;i++)
            {
               if(edit_page_array[i].dirt)
               {
                  dirty += 1;
               }
            }

            // Message
            if(dirty>0)
            {
               // Message box
               qjide_message_box("WARNING","Warning","One or more files ar not saved.<br><br>Please save them, before close!");

               // Return
               return;
            }

            // Loop over pages
            for(var i=0;i<edit_page_array.length;i++)
            {
               // Remove page from tab view
               edit_tab_view.remove(edit_page_array[i].page);
            }

            // Empty pages array
            edit_page_array = [];

            // Enable page select event
            edit_page_event = true;
         }

         // We add one page
         add_edit_page("temp.ijs","NB. temp.ijs\r\n\r\n");

         // Handle tab key
         //edit_text_area.addListener("keydown",tab_key_handler,edit_text_area);

         ///////////////////////////////////////////////////////////////////////
         // Terminal area
         ///////////////////////////////////////////////////////////////////////

         // Create term tab view
         var term_tab_view = new qx.ui.tabview.TabView("top");
         term_tab_view.setBackgroundColor("#afafaf");
         term_tab_view.setContentPadding(0,0,0,0);

         // Create term page
         var edit_term_page = new qx.ui.tabview.Page("Terminal","resource/qjide/terminal.png");
         edit_term_page.setLayout(new qx.ui.layout.Grow());

         // Create view page
         var edit_view_page = new qx.ui.tabview.Page("Verb Definition Viewer","resource/qjide/viewer.png");
         edit_view_page.setLayout(new qx.ui.layout.Dock());

         // Add pages to tab view
         term_tab_view.add(edit_term_page);
         term_tab_view.add(edit_view_page);

         // Add tab view to term container
         term_view_cont.add(term_tab_view);

         // Create term area
         var edit_term_area = new qx.ui.form.TextArea();
         edit_term_area.setFont(edit_text_font);
         edit_term_area.setDecorator(null);
         edit_term_area.setBackgroundColor("#222222");
         edit_term_area.setTextColor("#00ff00");
         edit_term_area.setNativeContextMenu(true);
         edit_term_area.setWrap(false);
         edit_term_area.setValue("[J console]\r\n\r\n   ");

         // Add text area to tab page
         edit_term_page.add(edit_term_area);

         // Handle tab key
         //edit_term_area.addListener("keydown",tab_key_handler,edit_term_area);

         // Handle enter key
         edit_term_area.addListener("keypress",function(e)
         {
            // Get key id
            var kid = e.getKeyIdentifier().toLowerCase();

            // Special key handling
            if(kid=="enter")
            {
               // Do not pass "enter" to the edit_term_area
               e.preventDefault();

               // Get text area value
               var val = this.getValue();

               // If there is no text (null) use empty text
               if(val==null) val = "";

               // Get text before and after caret
               var sta = this.getTextSelectionStart();
               var beg = 0;
               var end = 0;

               // Extract text line
               if(sta>0)
               {
                  if(val[sta]=='\n') sta -= 1;
                  for(beg=sta;beg>=0;beg--)
                  {
                     if(val[beg]=='\n')
                     {
                        beg += 1;
                        break;
                     }
                  }
               }
               for(end=sta;end<val.length;end++)
               {
                  if(val[end]=='\n')
                  {
                     end -= 1;
                     if(val[end]=='\r')
                     {
                        end -= 1;
                     }
                     if(end<(val.length-1)) end += 1;
                     break;
                  }
               }

               // Command line (input) and output
               var lin = val.substring(beg,end);
               var out = "";

               // Check whether the caret is at the end of the buffer
               if(sta==val.length)
               {
                  val += "\r\n";
                  this.setValue(val);
                  this.setTextSelection(val.length-1);
                  this.getContentElement().scrollToY(100000);

                  // Do some formatting for transfer
                  lin = lin.replace(/\\/g,"\\\\");
                  lin = lin.replace(/\"/g,"\\\"");
                  lin = encodeURIComponent(lin);

                  // Send command line
                  json = server_send({head:{fcode:"term",scode:"send"},data:lin});
                  if(json.head.rcode=="INF")
                  {
                     // Do nothing
                  }
                  else
                  {
                     // Error message
                     show_server_error();

                     // Return
                     return;
                  }

                  // Receive terminal output
                  receive_terminal_output();
               }
               else
               {
                  val += "\r\n" + lin;
                  this.setValue(val);
                  this.setTextSelection(val.length-1);
                  this.getContentElement().scrollToY(100000);
               }
            }
         },edit_term_area);

         // Create view toolbar
         var edit_view_tbar = new qx.ui.toolbar.ToolBar();

         // Create label
         var edit_view_edit_button = new qx.ui.toolbar.Button("Edit script: ","resource/qjide/jblue.png");

         // Add components to toolbar
         edit_view_tbar.add(edit_view_edit_button);

         // Edit button action
         edit_view_edit_button.addListener("execute",function(e)
         {
            // Get script name
            var scr = edit_view_edit_button.getLabel().substr(13);

            // Get script text
            if(scr!="")
            {
               json = server_send({head:{fcode:"navi",scode:"goto"},data:scr});
               if(json.head.rcode=="INF")
               {
                  // Get file and text
                  var fil = json.data.file;
                  var tex = json.data.text;

                  // Add edit page
                  add_edit_page(fil,tex);
               }
               else
               {
                  // Error message
                  show_server_error();

                  // Return
                  return;
               }
            }
         },this);

         // Create view area
         var edit_view_area = new qx.ui.form.TextArea();
         edit_view_area.setFont(edit_text_font);
         edit_view_area.setDecorator(null);
         edit_view_area.setBackgroundColor("#cccccc");
         edit_view_area.setTextColor("#000000");
         edit_view_area.setNativeContextMenu(true);
         edit_view_area.setWrap(false);
         edit_view_area.setReadOnly(true);

         // Add text area to tab page
         edit_view_page.add(edit_view_tbar,{edge:"north" });
         edit_view_page.add(edit_view_area,{edge:"center"});

         // Get Plot url
         if(plot_url=="")
         {
            // Send command line
            json = server_send({head:{fcode:"url",scode:"plot"},data:""});
            if(json.head.rcode=="INF")
            {
               // Set plot_url
               plot_url = json.data;
            }
            else
            {
               // Error message
               show_server_error();

               // Return
               return;
            }
         }

         // Create plot area
         var edit_plot_area = new qx.ui.embed.Iframe(plot_url);
         edit_plot_area.setNativeContextMenu(true);

         // Add plot area to plot view container
         plot_view_cont.add(edit_plot_area);

         ///////////////////////////////////////////////////////////////////////
         // Status bar
         ///////////////////////////////////////////////////////////////////////

         // Status bar
         var status_bar = new qx.ui.container.Composite(new qx.ui.layout.Dock());
         status_bar.setDecorator("menubar");

         // Status label
         var status_lab = new qx.ui.basic.Label();
         status_lab.setRich(true);
         status_lab.setValue("&nbsp;J IDE ready ...");

         // Add status label to status bar
         status_bar.add(status_lab);

         ///////////////////////////////////////////////////////////////////////
         // Add all the created stuff to the root container
         ///////////////////////////////////////////////////////////////////////

         // Add widgets to root container
         root_container.add(menu_frame,{edge:"north" });
         root_container.add(main_split,{edge:"center"});
         root_container.add(status_bar,{edge:"south" });

         // Resize some widgets
         function root_container_resize()
         {
            root_container.setWidth(qx.bom.Viewport.getWidth());
            root_container.setHeight(qx.bom.Viewport.getHeight());
         }

         // Resize listener
         root.addListener("resize",root_container_resize,this);

         // Ensure thar our container fills the browser window when it appears
         root_container_resize();

         // Add gui to root
         //root.add(root_container);

         ///////////////////////////////////////////////////////////////////////
         // Connection check and other initialization stuff
         ///////////////////////////////////////////////////////////////////////

         // Perform connection check ///////////////////////////////////////////
         json = server_send({head:{fcode:"check",scode:""},data:""});
         if(json.head.rcode=="INF")
         {
            // Information message in status bar
            status_lab.setValue("&nbsp;" + json.head.rmesg);
         }
         else
         {
            // Error message
            show_server_error();

            // Return
            return;
         }

         // Set font sizes (qjide.ijs) /////////////////////////////////////////

         // Editor font size
         json = server_send({head:{fcode:"fontsize",scode:"editor"},data:""});
         if(json.head.rcode=="INF")
         {
            // Loop over document styles
            for(var i=0;i<document.styleSheets.length;i++)
            {
               var css_style_rules = new Array();
               var css_style_found = false;
               if(document.styleSheets[i].cssRules) css_style_rules = document.styleSheets[i].cssRules;
               if(document.styleSheets[i].rules   ) css_style_rules = document.styleSheets[i].rules;
               for(var j=0;j<css_style_rules.length;j++)
               {
                  if(css_style_rules[j].selectorText==".CodeMirror")
                  {
                     css_style_rules[j].style.setProperty("font-size",json.data+"pt");
                     css_style_found = true;
                     break;
                  }
               }
               if(css_style_found)
               {
                  break;
               }
            }
         }
         else
         {
            // Error message
            show_server_error();
         }

         // Console font size
         json = server_send({head:{fcode:"fontsize",scode:"console"},data:""});
         if(json.head.rcode=="INF")
         {
            // Set new font
            edit_text_font = new qx.bom.Font(json.data,["courier new","courier","monospace"]);

            // Update already created widgets
            edit_term_area.setFont(edit_text_font);
            edit_view_area.setFont(edit_text_font);
         }
         else
         {
            // Error message
            show_server_error();
         }

         // Get files in J user directory //////////////////////////////////////
         json = server_send({head:{fcode:"navi",scode:"goto"},data:"."});
         if(json.head.rcode=="INF")
         {
            // Fill file tree
            navi_dir_label.setValue(json.data.path);
            navi_dir_label.getContentElement().scrollToX(1000);
            navi_file_tree_fill(json.data.files);
         }
         else
         {
            // Error message
            show_server_error();

            // Return
            return;
         }

         // Get locales ////////////////////////////////////////////////////////
         json = server_send({head:{fcode:"navi",scode:"locales"},data:""});
         if(json.head.rcode=="INF")
         {
            // Check whether file or directory
            if(json.head.rmesg=="LOC")
            {
               navi_locale_label.setValue("<All Locales>");
               navi_shows_locales = true;
               navi_defs_tree_fill(json.data,true);
            }
         }
         else
         {
            // Error message
            show_server_error();

            // Return
            return;
         }

         // Run startup J script ///////////////////////////////////////////////
         json = server_send({head:{fcode:"wwd",scode:"start"},data:""});
         if(json.head.rcode=="INF")
         {
            // Check rmesg
            if(json.head.rmesg=="START")
            {
               // Do nothing
            }
            else
            {
               // Add IDE gui to root
               var scroller = new qx.ui.container.Scroll(root_container);
               root.add(scroller,{top:0,left:0,right:0,bottom:0});
               //root.add(root_container);
            }
         }
         else
         {
            // Error message
            show_server_error();

            // Return
            return;
         }

         // Receive pending terminal output
         receive_terminal_output();

         ///////////////////////////////////////////////////////////////////////
         // Above is your actual application code...
         ///////////////////////////////////////////////////////////////////////

      } // main

   } // members

}); // qx.Class.define

////////////////////////////////////////////////////////////////////////////////
// EOF
////////////////////////////////////////////////////////////////////////////////
