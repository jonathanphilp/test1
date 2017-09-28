import System;
import System.ComponentModel;
import System.IO;
import System.Net;
import System.Text;
import System.Windows;
import System.Windows.Controls;
import System.Windows.Input;
import MForms;
import Mango.UI;
import Mango.UI.Services
import Lawson.M3.MI;
import Mango.Services;
import Lawson.Shared.PF.Trigger;
import Lawson.Shared.PF.Trigger.Events;

package MForms.JScript {
   class SOS419F2_search {
      var DIVI;
      var RORN, RORL;
      var CONO;
      var gController, gContent, gDebug : Object;
      var approveButton : Button;
      var strBtnTag;
      var strUserid;
      var strURI;
      public function Init(element: Object, args: Object, controller : Object, debug : Object) {
         this.gController = controller;
         this.gContent = gController.RenderEngine.Content;
         this.gDebug = debug;
         
         debug.WriteLine("Script Initializing.");
         if(element != null) {
            debug.WriteLine("Connected element: " + element.Name);
         }

         var content : Object = controller.RenderEngine.Content;

       
         
                     strBtnTag = "";
            
			// instantiate the button
			approveButton = new Button();
			approveButton.Tag = 'Search OIS301';
			approveButton.Content = 'Search OIS301';
			approveButton.ToolTip = 'Search OIS301';

			// position the button horizontally
			approveButton.HorizontalAlignment = HorizontalAlignment.Left;
			Grid.SetColumn(approveButton, 68);
			Grid.SetColumnSpan(approveButton, 98);

			// position the button vertically
			approveButton.VerticalAlignment = VerticalAlignment.Top;
			approveButton.Width = 10 * Configuration.CellWidth;
			Grid.SetRow(approveButton,4);
		
			
			approveButton.add_Click(OnClick);
			approveButton.add_Unloaded(OnUnloaded);
			content.Children.Add(approveButton);

      }
      		function OnClick(sender: Object, e: RoutedEventArgs) {
			var btn = e.OriginalSource;		
			Log("Clicking button...");
            // reset variables
            var user = ApplicationServices.UserContext;
            strUserid = user.UserName;
            CONO = UserContext.Company;
                
            RORN = "";
            RORL = "";
            strBtnTag = "";
            var content : Object = gController.RenderEngine.Content;
            
	
                RORN = ScriptUtil.FindChild(content, "WWRORN");
                RORL = ScriptUtil.FindChild(content, "WWRORL");
                Log("getColumnData called... RORN: ");
                Log(RORN);
                Log("getColumnData called... RORL: ");
                Log(RORL);
                
                if (RORL == "") {
                    return;
                }
          
                strBtnTag = btn.Tag;
                strURI = "mforms://search?program=OIS301&query=ORNO:(\"" + RORN.Text + "\") PONR:(\"" + RORL.Text + "\")&sortingorder=1&view&";
                //mforms://search?program=SOS419&query=RORN:("1000006209")+ITNO:("95060001")&sortingorder=1&view&
                Log("strURI compiled...");
                Log(strURI);
                DashboardTaskService.Current.LaunchTask(new Uri(strURI));

  
			
		}
		
		 // event handler for when the user leaves the Panel
		function OnUnloaded(sender: Object, e: RoutedEventArgs) {
			sender.remove_Unloaded(OnUnloaded);
			sender.remove_Click(OnClick);
            sender = null;
		}
		

		
		function Log(text : String)
		{
			gDebug.WriteLine(text);
			return;
		}  
   }
}
