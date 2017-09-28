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
   class OIS101_search {
      var DIVI;
      var ORNO, ITNO;
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

         // TODO Add your code here
         
                     strBtnTag = "";
            
			// instantiate the button
			approveButton = new Button();
			approveButton.Tag = 'Search SOS149';
			approveButton.Content = 'Search SOS149';
			approveButton.ToolTip = 'Search SOS149';

			// position the button horizontally
			approveButton.HorizontalAlignment = HorizontalAlignment.Left;
			Grid.SetColumn(approveButton, 45);
			Grid.SetColumnSpan(approveButton, 98);

			// position the button vertically
			approveButton.VerticalAlignment = VerticalAlignment.Top;
			approveButton.Width = 9 * Configuration.CellWidth;
			Grid.SetRow(approveButton, 2);
			//Grid.SetRowSpan(approveButton, 23);
			
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
                
            ORNO = "";
            ITNO = "";
            strBtnTag = "";
            var content : Object = gController.RenderEngine.Content;
            
		//	if(btn.Tag == "APPROVE" || btn.Tag == "CLOSE" || btn.Tag == 'URGENT APPROVAL') {
        //    
        //    
                //ORNO = getColumnData(gController, "ORNO");
                ORNO = ScriptUtil.FindChild(content, "OAORNO");
                ITNO = getColumnData(gController, "ITNO");
                Log("getColumnData called... ORNO: ");
                Log(ORNO);
                Log("getColumnData called... ITNO: ");
                Log(ITNO);
                
                if (ITNO == "") {
                    return;
                }
        //        
                strBtnTag = btn.Tag;
                strURI = "mforms://search?program=SOS419&query=RORN:(\"" + ORNO.Text + "\")+ITNO:(\"" + ITNO + "\")&sortingorder=1&view&";
                //mforms://search?program=SOS419&query=RORN:("1000006209")+ITNO:("95060001")&sortingorder=1&view&
                Log("strURI compiled...");
                Log(strURI);
                DashboardTaskService.Current.LaunchTask(new Uri(strURI));
                //window.open("http://www.w3schools.com");
                //callProcessFlow();
        //        callCRS610MI_GetBasicData();
        //        
		//	}
			
		}
		
		 // event handler for when the user leaves the Panel
		function OnUnloaded(sender: Object, e: RoutedEventArgs) {
			sender.remove_Unloaded(OnUnloaded);
			sender.remove_Click(OnClick);
            sender = null;
		}
		
		function getColumnData(controller : Object, columnName : String) : String
		{
			// Get the number of columns of data.
			var listControl = controller.RenderEngine.ListControl;
			var columns = listControl.Columns;
			Log("Calling 'getColumnData'...");
			// Find the desired column.
			var columnIndex = -1;
			for(var i=0; i<columns.Count; i++)
			{
            	if(columns[i] == columnName)
				{
					columnIndex = i;
					break;
				}
			}
			
			if (columnIndex < 0)
			{
				// Can not find column.
				Log("getColumnData values: [no data]");
				return (""); 
			}
			
			// Get the selected row number.
			var list : Object = controller.RenderEngine.ListViewControl;
			var rowIndex : int;
			rowIndex = list.SelectedIndex;
			
			// Get the data from the selected row.
			if(rowIndex >= 0)
			{
				var item : Object = list.Items[rowIndex];
				var strColValue : String = item[columnIndex];                
			}
			else
			{
				// No row was selected.
				ConfirmDialog.ShowWarningDialogWithoutCancel("Row Selection Error", "You must select a row before clicking Approve or Close buttons", null);
				return ("");
			}
			// Return the contents of the column.
			Log("getColumnData values: rowIndex: ");
			Log(rowIndex);
			Log("strColValue: ");
			Log(strColValue);
			return (strColValue); 
			
		}   
		
		function Log(text : String)
		{
			gDebug.WriteLine(text);
			return;
		}  
   }
}
