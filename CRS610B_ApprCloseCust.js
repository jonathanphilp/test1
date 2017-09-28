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

   class CRS610B_ApprCloseCust {
   		
        var CUTP;
        var STAT;
        var PONO;
        var CUNO;
        var DIVI;
        var CUNM;
        var CUCL;
        var CONO;
        var CFC5;
        var strUserid;
        var strBtnTag;
        var gController, gContent, gDebug : Object;
		var gWorker, gUrl, gResponseText, gErrorMessage;
		var gpfiURL, gstrDatabase, gpfiServer, gsignonURL, gssoUser, gssoPassword, gpanelError : String;
        var approveButton : Button;
        var closeButton : Button;
        var urgentApprButton : Button;
   		
   		public function Init(element: Object, args: Object, controller : Object, debug : Object) {
   		
            this.gController = controller;
            this.gContent = gController.RenderEngine.Content;
            this.gDebug = debug;
   			Log("Script Initializing.");
            if(element != null) {
                debug.WriteLine("Connected element: " + element.Name);
            }
            
            var content : Object = controller.RenderEngine.Content;
            strBtnTag = "";
            
			// instantiate the button
			approveButton = new Button();
			approveButton.Tag = 'APPROVE';
			approveButton.Content = 'Approve';
			approveButton.ToolTip = 'Approve Customer';

			// position the button horizontally
			approveButton.HorizontalAlignment = HorizontalAlignment.Left;
			Grid.SetColumn(approveButton, 45);
			Grid.SetColumnSpan(approveButton, 98);

			// position the button vertically
			approveButton.VerticalAlignment = VerticalAlignment.Top;
			approveButton.Width = 9 * Configuration.CellWidth;
			Grid.SetRow(approveButton, 2);
			//Grid.SetRowSpan(approveButton, 23);
			
			// instantiate the button
			closeButton = new Button();
			closeButton.Tag = 'CLOSE';
			closeButton.Content = 'Close';
			closeButton.ToolTip = 'Close Customer';

			// position the button horizontally
			closeButton.HorizontalAlignment = HorizontalAlignment.Left;
			closeButton.Width = 9 * Configuration.CellWidth;
			Grid.SetColumn(closeButton, 1);
			Grid.SetColumnSpan(closeButton, 12);

			// position the button vertically
			closeButton.VerticalAlignment = VerticalAlignment.Top;
			Grid.SetRow(closeButton,0);
			//Grid.SetRowSpan(closeButton, 23);
            
            // instantiate the button
			urgentApprButton = new Button();
            urgentApprButton.Tag = 'URGENT APPROVAL';
			urgentApprButton.Content = 'Urgent Approval';
			urgentApprButton.ToolTip = 'Urgent Customer Approval';

			// position the button horizontally
			urgentApprButton.HorizontalAlignment = HorizontalAlignment.Left;
            urgentApprButton.Width = 11 * Configuration.CellWidth;
			Grid.SetColumn(urgentApprButton, 63);
			Grid.SetColumnSpan(urgentApprButton, 98);

			// position the button vertically
            urgentApprButton.VerticalAlignment = VerticalAlignment.Top;
			Grid.SetRow(urgentApprButton, 2);
			//Grid.SetRowSpan(urgentApprButton, 23);
			
			// add the button to the Panel
			controller.RenderEngine.Content.Children.Add(approveButton);
			controller.RenderEngine.Content.Children.Add(closeButton);
            controller.RenderEngine.Content.Children.Add(urgentApprButton);

			// add event handlers
			approveButton.add_Click(OnClick);
			approveButton.add_Unloaded(OnUnloaded);
			closeButton.add_Click(OnClick);
			closeButton.add_Unloaded(OnUnloaded);
            urgentApprButton.add_Click(OnClick);
		    urgentApprButton.add_Unloaded(OnUnloaded);
			
		}
        
        // event handler for when the user clicks on the button
		function OnClick(sender: Object, e: RoutedEventArgs) {
			var btn = e.OriginalSource;		
			
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
            strBtnTag = "";
            
			if(btn.Tag == "APPROVE" || btn.Tag == "CLOSE" || btn.Tag == 'URGENT APPROVAL') {
            
            
                CUNO = getColumnData(gController, "CUNO");
                Log("CUNO:  " + CUNO);
                if (CUNO == "") {
                    return;
                }
                
                strBtnTag = btn.Tag;
                callCRS610MI_GetBasicData();
                
			}
			
		}
        
        function callProcessFlow() 
        {
            var flowName;
            if (strBtnTag == "CLOSE") {
                flowName = "DelCustCflowT";
            } else {
                flowName = "NewCustCflowT";
            }
            
            if (PFTrigger.HasTriggerService) {

                var curDate = new Date();
                var service = flowName;
                var product = 'ERP';
                var dataArea = 'LMTSTLPA';
                var category = '';
                var title = "";
                if (strBtnTag == "URGENT APPROVAL") {
                    title = "(" + strUserid + ") Customer " + CUNO + " Urgent Approval ";
                } else {
                    title = "(" + strUserid + ") Customer " + CUNO + " Approval ";               
                }
                
                var trigger = new PFTrigger(service, product, dataArea, category, title);
                trigger.AddVariable('CUNO', CUNO, 'String');
                trigger.AddVariable('CUNM', CUNM, 'String');
                trigger.AddVariable('DIVI', DIVI, 'String');     
                trigger.AddVariable('CUTP', CUTP, 'String');   
                trigger.AddVariable('CUCL', CUCL, 'String');  
                trigger.AddVariable('STAT', STAT, 'String');
                trigger.AddVariable('PONO', PONO, 'String');
                trigger.AddVariable('CONO', CONO, 'String');
                if (strBtnTag == "URGENT APPROVAL") {
                    trigger.AddVariable('startProgram_OldValue', "(This request is URGENT)", 'String');
                } else {  
                    trigger.AddVariable('startProgram_OldValue', "", 'String');
                }
                trigger.AddVariable('owner', strUserid, 'String');
                
                trigger.SubmitRequest(dataArea, OnTriggerCompleted);
                
            } 
            
        }
        
        
        function OnTriggerCompleted(args: PFTriggerEventArgs) {
            SetWaitCursor(false); 
            if (args != null && args.IsException) {
            
                Log("Error: " + args.Exception.Message);
                ConfirmDialog.ShowWarningDialogWithoutCancel("ProcessFlow Error", args.Exception.Message, null);
            
                return;
            }
            if (args != null && args.IsSuccessful) {
                Log(args.Response.DetailMessage);
                if (strBtnTag == "URGENT APPROVAL") {
                
                    ConfirmDialog.ShowInformationDialog("ProcessFlow Status", "Your URGENT approval request has been submitted successfully.", null);
                } else {
                    ConfirmDialog.ShowInformationDialog("ProcessFlow Status", "Your approval request has been submitted successfully.", null);
                }
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
        
        function Log(text : String)
		{
			//gDebug.WriteLine(text);
			return;
		}
        
        public function SetWaitCursor(wait) {
            if (strBtnTag != null) {
                if (strBtnTag == "URGENT APPROVAL") {
                    urgentApprButton.IsEnabled = !wait;
                }
                if (strBtnTag == "APPROVE") {
                    approveButton.IsEnabled = !wait;
                }
                if (strBtnTag == "CLOSE") {
                    closeButton.IsEnabled = !wait;
                }
            }
            var element = gController.Host.Implementation;
            element.Cursor = wait ? Cursors.Wait : Cursors.Arrow;
            element.ForceCursor = true;
        }
        
        function callCRS610MI_GetBasicData() {
        
            SetWaitCursor(true);
            var record = new MIRecord();
            record["CONO"] = CONO;
            record["CUNO"] = CUNO;
            MIWorker.Run("CRS610MI", "GetBasicData", record, OnResultGetBasicData);            
                   
        } 
        
        public function OnResultGetBasicData(result: MIResponse)
		{   
            
			if(result.HasError) 
			{
                SetWaitCursor(false);
				ConfirmDialog.ShowErrorDialog("MIAccess error", result.Error.ToString(), null);            
				return;
			}      

            if (result.Item != null) {                
                DIVI = result.Item.GetString["DIVI"];	
                if (DIVI == null) {
                    DIVI = "";
                }
                CUNM = result.Item.GetString["CUNM"];	
                if (CUNM == null) {
                    CUNM = "";
                }
                CUTP = result.Item.GetString["CUTP"];	
                if (CUTP == null) {
                    CUTP = "";
                }
                STAT = result.Item.GetString["STAT"];	
                if (STAT == null) {
                    STAT = "";
                }
                PONO = result.Item.GetString["PONO"];	
                if (PONO == null) {
                    PONO = "";
                }
                CFC5 = result.Item.GetString["CFC5"];	
                if (CFC5 == null) {
                    CFC5 = "";
                }
                
                
            }
            Log("DIVI: " + DIVI);  
            Log("CUNM: " + CUNM); 
            Log("CUTP: " + CUTP); 
            Log("STAT: " + STAT); 
            Log("PONO: " + PONO); 
            Log("CFC5: " + CFC5); 

            if ((strBtnTag == "APPROVE" || strBtnTag == "URGENT APPROVAL")) {

                if ((STAT.Trim() != "10" && STAT.Trim() != "12" && STAT.Trim() != "90")) {
                    SetWaitCursor(false);
                    ConfirmDialog.ShowWarningDialogWithoutCancel("Invalid Status", "Customer status should be 10, 12 or 90.", null);
                    return;
                }
                
                if (STAT.Trim() == "10" && (CFC5.Trim() == "2" || CFC5.Trim() == "3" || CFC5.Trim() == "1")) {
                    SetWaitCursor(false);
                    ConfirmDialog.ShowWarningDialogWithoutCancel("Invalid Status", "Approval already in process.", null);
                    return;
                }
                               
            }
                        
            if (strBtnTag == "CLOSE" && STAT != "20") {
                SetWaitCursor(false);
                ConfirmDialog.ShowWarningDialogWithoutCancel("Invalid Status", "Customer status should be 20.", null);
                return;
                
            }
            
            if (strBtnTag == "CLOSE" && CFC5.Trim() == "7") {
                SetWaitCursor(false);
                ConfirmDialog.ShowWarningDialogWithoutCancel("Invalid Status", "Close request already in process.", null);
                return;
            }
            
            if (strBtnTag == "CLOSE") {            
                if (CFC5 == "7") {
                    callCRS610MI_ChgBasicData_CFC5_0();
                } else {
                    callCRS610MI_ChgBasicData_CFC5_7();
                }
            } else {
               callProcessFlow();
            }
		}

        function callCRS610MI_ChgBasicData_CFC5_0() {
        
            // reset to 0
            var record = new MIRecord();
            record["CONO"] = CONO;
            record["CUNO"] = CUNO;
            record["CFC5"] = "0";
            MIWorker.Run("CRS610MI", "ChgBasicData", record, OnResultChgBasicData_CFC5_0);
                   
        } 
        
        public function OnResultChgBasicData_CFC5_0(result: MIResponse)
		{   
            callCRS610MI_ChgBasicData_CFC5_7();
        }
        
        function callCRS610MI_ChgBasicData_CFC5_7() {
        
            // set to 7 to trigger Event Hub
            var record = new MIRecord();
            record["CONO"] = CONO;
            record["CUNO"] = CUNO;
            record["CFC5"] = "7";
            MIWorker.Run("CRS610MI", "ChgBasicData", record, OnResultChgBasicData_CFC5_7);
           
        } 
        
        public function OnResultChgBasicData_CFC5_7(result: MIResponse)
		{   
            SetWaitCursor(false);       
            ConfirmDialog.ShowInformationDialog("ProcessFlow Status", "Your close customer request has been processed.", null);
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
			return (strColValue); 
		}
	  
   }
}
