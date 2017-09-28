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
   class callGenericAuditOIS300 {
   	    var ORNO, CONO;
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
			approveButton.Tag = 'Start Audit';
			approveButton.Content = 'Start Audit';
			approveButton.ToolTip = 'Start Audit';

			// position the button horizontally
			approveButton.HorizontalAlignment = HorizontalAlignment.Left;
			Grid.SetColumn(approveButton, 72);
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
            ORNO = ScriptUtil.FindChild(gContent, "OAORNO").Text;    
            //DIVI = "";
            //CUNM = "";
            //CUTP = "";
            //CUCL = "";
            //STAT = "";
            //PONO = "";
            //CUNO = "";
            //CFC5 = "";
            //ITNO = "";
            strBtnTag = "";
            
		//	if(btn.Tag == "APPROVE" || btn.Tag == "CLOSE" || btn.Tag == 'URGENT APPROVAL') {
        //    
        //    
                //ITNO = getColumnData(gController, "ITNO");
                Log("getData called... ORNO: ");
                Log(ORNO);
                //Log("ITNO:  " + ITNO);
                if (ORNO == "") {
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

            flowName = "GenericSingleAudit";
			Log("Calling IPA flow...");


            
            if (PFTrigger.HasTriggerService) {
				Log("Trigger has service...");
                var curDate = new Date();
                var service = flowName;
                var product = 'ERP';
                var dataArea = 'LMDEVLPA';
                var category = '';
                var title = "";
                title = "(" + strUserid + ") Generic Single Audit of " + ORNO;               
                
                var trigger = new PFTrigger(service, product, dataArea, category, title);
                trigger.AddVariable('TFLOW', "NewCreditAppr");
                trigger.AddVariable('TVAR', "CustOrderNo");
                trigger.AddVariable('TVAL', ORNO);     
                trigger.AddVariable('owner', strUserid);
                Log("Trigger configured");
                trigger.SubmitRequest(dataArea, OnTriggerCompleted);
                Log("Trigger submitted");
            } 
            
        }
        
        
        function OnTriggerCompleted(args: PFTriggerEventArgs) {
            SetWaitCursor(false); 
            if (args != null && args.IsException) {
            
                //Log("Error: " + args.Exception.Message);
                ConfirmDialog.ShowWarningDialogWithoutCancel("ProcessFlow Error", args.Exception.Message, null);
                 Log("DetailMessage = " + args.Response.DetailMessage); 
                //    "ErrorCode = " + args.Response.ErrorCode + "\n" + 
                //    "InformationCode = " + args.Response.InformationCode + "\n" + 
                //    "ReturnCode = " + args.Response.ReturnCode + "\n" + 
                //    "ReturnData = " + args.Response.ReturnData + "\n" + 
                //    "Status = " + args.Response.Status + "\n" + 
                //   "WorkunitNumber = " + args.Response.WorkunitNumber + "\n", null);
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
        
		
		function Log(text : String)
		{
			gDebug.WriteLine(text);
			return;
		}     										
   }
}
