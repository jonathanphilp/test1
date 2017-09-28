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
import Lawson.M3.MI;
import Mango.Services;
import Lawson.Shared.PF.Trigger;
import Lawson.Shared.PF.Trigger.Events;


package MForms.JScript {
   class callNewItemIPA {
   	    var CUTP;
        var STAT;
        var PONO;
        var CUNO;
        var DIVI;
        var CUNM;
        var CUCL;
        var CONO;
        var CFC5;
        var ITNO;
        var strUserid;
        var strBtnTag;
        var gController, gContent, gDebug : Object;
		var gWorker, gUrl, gResponseText, gErrorMessage;
		var gpfiURL, gstrDatabase, gpfiServer, gsignonURL, gssoUser, gssoPassword, gpanelError : String;
        var approveButton : Button;

   		
      public function Init(element: Object, args: Object, controller : Object, debug : Object) {
         this.gController = controller;
         this.gContent = gController.RenderEngine.Content;
         this.gDebug = debug;
         Log("Script Initializing.");
         if(element != null) {
            Log("Connected element: " + element.Name);
         }

         var content : Object = controller.RenderEngine.Content;

         // TODO Add your code here
         
            strBtnTag = "";
            
			// instantiate the button
			approveButton = new Button();
			approveButton.Tag = 'APPROVE';
			approveButton.Content = 'Start Workflow';
			approveButton.ToolTip = 'Start New Item Workflow';

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
      
      
              // event handler for when the user clicks on the button
		function OnClick(sender: Object, e: RoutedEventArgs) {
			var btn = e.OriginalSource;		
			Log("Clicking button...");
            // reset variables
            var user = ApplicationServices.UserContext;
            strUserid = user.UserName;
            CONO = UserContext.Company;
                
            DIVI = "";
            CUNM = "";
            CUTP = "";
            CUCL = "";
            STAT = "";
            PONO = "";
            CUNO = "";
            CFC5 = "";
            ITNO = "";
            strBtnTag = "";
            
		//	if(btn.Tag == "APPROVE" || btn.Tag == "CLOSE" || btn.Tag == 'URGENT APPROVAL') {
        //    
        //    
                ITNO = getColumnData(gController, "ITNO");
                Log("getColumnData called... ITNO: ");
                Log(ITNO);
                //Log("ITNO:  " + ITNO);
                if (ITNO == "") {
                    return;
                }
        //        
                strBtnTag = btn.Tag;
                callProcessFlow();
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

		
        function callProcessFlow() 
        {
            var flowName;

            flowName = "MOSendMessage";
			Log("Calling IPA flow...");


            
            if (PFTrigger.HasTriggerService) {

                var curDate = new Date();
                var service = flowName;
                var product = 'ERP';
                var dataArea = 'LMDEVLPA';
                var category = '';
                var title = "";
                title = "(" + strUserid + ") Customer " + ITNO + " Approval ";               
                
                var trigger = new PFTrigger(service, product, dataArea, category, title);
                trigger.AddVariable('CUNO', CUNO, 'String');
                trigger.AddVariable('CUNM', CUNM, 'String');
                trigger.AddVariable('DIVI', DIVI, 'String');     
                trigger.AddVariable('CUTP', CUTP, 'String');   
                trigger.AddVariable('CUCL', CUCL, 'String');  
                trigger.AddVariable('STAT', STAT, 'String');
                trigger.AddVariable('PONO', PONO, 'String');
                trigger.AddVariable('CONO', CONO, 'String');
                trigger.AddVariable('ITNO', ITNO, 'String');

                trigger.AddVariable('startProgram_OldValue', "", 'String');

                trigger.AddVariable('owner', strUserid, 'String');
                
                trigger.SubmitRequest(dataArea, OnTriggerCompleted);
                
            } 
            
        }
        
        
        function OnTriggerCompleted(args: PFTriggerEventArgs) {
            SetWaitCursor(false); 
            if (args != null && args.IsException) {
            
                //Log("Error: " + args.Exception.Message);
                ConfirmDialog.ShowWarningDialogWithoutCancel("ProcessFlow Error", args.Exception.Message, null);
            
                return;
            }
            if (args != null && args.IsSuccessful) {
                //Log(args.Response.DetailMessage);
                ConfirmDialog.ShowInformationDialog("ProcessFlow Status", "Your approval request has been submitted successfully.", null);
                //ConfirmDialog.ShowInformationDialog("ProcessFlow Status", "Process Started Successfully\n\n" + 
                //    "DetailMessage = " + args.Response.DetailMessage + "\n" + 
                //    "ErrorCode = " + args.Response.ErrorCode + "\n" + 
                //    "InformationCode = " + args.Response.InformationCode + "\n" + 
                //    "ReturnCode = " + args.Response.ReturnCode + "\n" + 
                //    "ReturnData = " + args.Response.ReturnData + "\n" + 
                //    "Status = " + args.Response.Status + "\n" + 
                //   "WorkunitNumber = " + args.Response.WorkunitNumber + "\n", null);
                return;
            }
        }				
        
	    public function SetWaitCursor(wait) {
            if (strBtnTag != null) {

                if (strBtnTag == "APPROVE") {
                    approveButton.IsEnabled = !wait;
                }

            }
            var element = gController.Host.Implementation;
            element.Cursor = wait ? Cursors.Wait : Cursors.Arrow;
            element.ForceCursor = true;
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
