import Lawson.M3.MI;
import Lawson.Shared.PF.Trigger.Events;
import Lawson.Shared.PF.Trigger;
import MForms;
import Mango.Services;
import Mango.UI.Core.Util;
import Mango.UI.Core;
import Mango.UI.Services.Mashup;
import Mango.UI.Services;
import Mango.UI.Utils;
import Mango.UI;
import Microsoft.VisualBasic;
import System.Collections.Generic;
import System.ComponentModel;
import System.Data;
import System.IO;
import System.Linq;
import System.Net;
import System.Text;
import System.Windows.Controls;
import System.Windows.Forms;
import System.Windows.Input;
import System.Windows;
import System;

package MForms.JScript {
  class cs_convert {
    var dotLoc, gCONO : int
    var userName, password,gITNO, gITDS, gRESP, gITTY, gSTATcbx, gSTAT, gUSER : String
    var fmt, gDIVI, gLANG, gRunURL, OutputFields, Strings, gSYSTEM : String
    var vTXID, vLINO : String
    var gController, gContent, gDebug : Object;
    var vHeaderExists, gAPICompleted,vUpdMMTXID : Boolean;
    var BtnAPPR : Button;
    var vCursor : Cursor;
    var gNOW, vEnd : DateTime
   
    function OnRequested(sender: Object, e: RequestEventArgs)
        {
            try
            {
            	
                //InstanceController controller = (InstanceController)sender;
                // clean-up
                //controller.Requesting -= OnRequesting;
                //controller.Requested -= OnRequested;
                
                gController.remove_Requesting(OnRequesting);
                gController.remove_Requested(OnRequested);
                
            }
            catch(e)
            { 
            }
            
        }
   
   
   function OnRequesting(sender: Object, e: CancelRequestEventArgs)
        {
              gDebug.WriteLine("requesting");
            try
            {
                if (e.CommandType == "LSTOPT")
                {
                	gDebug.WriteLine("lstopt");
                    InstanceCache.Add(gController, "LSTOPT", e.CommandValue); // set the entry mode
                }
            }
            catch(e) 
            {
               gDebug.WriteLine("catch");
            }
        }
   
    public function Init(element: Object, args: Object, controller : Object, debug : Object) {
      
      this.gController = controller;
      this.gContent = gController.RenderEngine.Content;
      this.gDebug = debug;
      
      debug.WriteLine("Script Initializing.");
      if(element != null) {
        debug.WriteLine("Connected element: " + element.Name);
      }


      gController.add_Requested(OnRequested);
      gController.add_Requesting(OnRequesting);

      var content : Object = controller.RenderEngine.Content;

      // TODO Add your code here
         
      debug.WriteLine("1");
         

      try {
        //if not panel E Exit
        if (controller.PanelState.PanelLetter != "E") {
          return;
        }
      }
      catch(e) { 
      }   

      debug.WriteLine("1");



      if (InstanceCache.ContainsKey(gController, "LSTOPT"))
                {
                    var LSTOPT = InstanceCache.Get(gController, "LSTOPT"); // get the entry mode

					debug.WriteLine("LSTOPT");
					debug.WriteLine(LSTOPT);

                    if (LSTOPT == "2" || LSTOPT == "-1")
                    {
                        // Only add button on Change or Create
                    }
                    else
                    {
                        return;
                    }
                }

      try {
        // controller.Runtime.ApplicationServer.M3Address
        // controller.Runtime.ApplicationServer.M3Port
        // controller.Runtime.ApplicationServer.M3Ip

        ///    Grid content = controller.RenderEngine.Content;
        try {
          gITNO = ScriptUtil.FindChild(content, "WEITNO");
          gITDS = ScriptUtil.FindChild(content, "MMITDS");
          gRESP = ScriptUtil.FindChild(content, "MMRESP");
          gITTY = ScriptUtil.FindChild(content, "MMITTY");
          gSTATcbx = ScriptUtil.FindChild(content, "MMSTAT");
        }
        catch(e) { 
        }
        
              debug.WriteLine("1");
        
        try {
          gSTAT = gSTATcbx.Text;
                debug.WriteLine("2");
          
          ///    int result = gSTAT.CompareTo("30");

        }
        catch(e)
        
         { 
        }
        
              debug.WriteLine("4");
        
        gUSER = UserContext.User;
        gCONO = UserContext.Company;
        gDIVI = UserContext.CurrentDivision;
        gLANG = UserContext.CurrentLanguage;
        gRunURL = controller.Runtime.ApplicationServer.RuntimeUrl;
        //dotLoc = 0;
        //dotLoc = Microsoft.VisualBasic.Strings.InStr(gRunURL, ".");
        //gSYSTEM = Microsoft.VisualBasic.Strings.UCase("" + gRunURL.Substring(7, dotLoc - 8));
        gSYSTEM = controller.Runtime.ApplicationServer.M3Ip;
        try {
          ApplicationServices.UserContext.RequestCredentials("M3", "MForms", &userName, &password);
        }
        catch(e) {
        }
        vHeaderExists = false;
        
        
        try {
          //       var outparms = new MIParameters {
          //       OutputFields = "TXID";
          //     }    ;
          var request = new MIRequest();
          request.Program = "CRS980MI";
          request.Transaction = "GetTextID";
          //     request.MIParameters = outparms;
          //request.Context userName, "BHMOWEN01";
          //request.Tag = contentPresenter;
          var record = new MIRecord();
          record["FILE"] = "MITMAS00";
          record["KV01"] = gCONO;
          record["KV02"] = gITNO.Text;
          request.Record = record;
          gAPICompleted = false;
         
          
          MIWorker.Run(request, GTIOnCompleted);
                   
          
          DoAPIWait(20);
          //MIWorker.Run("CRS980MI", "GetTextID", record, GTIOnCompleted);
          ////MIWorker.Run("CRS980MI", "GetTextID", record, GTIOnCompleted, outparms);     
          
                                 debug.WriteLine(vTXID); 
        }
        catch (ex) {
          Console.WriteLine(ex.Message);
        }
        
        try {
                                         debug.WriteLine("chk"); 
                                         debug.WriteLine(vTXID); 
          if (vTXID != "0") {
          //Check if text block already exists.  if so, do not enable button.
            var request = new MIRequest();
            request.Program = "CRS980MI";
            request.Transaction = "SltTxtBlock";
            var record = new MIRecord();
            record["CONO"] = gCONO;
            record["TXID"] = vTXID;
            record["TXVR"] = "APPROVE";
            record["LNCD"] = gLANG;
            record["TFIL"] = "MSYTXH";
            request.Record = record;
            gAPICompleted = false;
            
            MIWorker.Run(request, STBOnCompleted);
            DoAPIWait(20);
            
                                             debug.WriteLine(vHeaderExists); 
          }
        }
        catch(e) { 
        }
                                                     debug.WriteLine("addbutton"); 
        
     	BtnAPPR = new Button();
        //System.Windows.Controls.Button BtnAPPR = new System.Windows.Controls.Button();
        BtnAPPR.Tag = "BtnAPPR";
        BtnAPPR.Width = 100;
        BtnAPPR.Content = 'Start Workflow';
		BtnAPPR.ToolTip = 'Start New Item Workflow';
		BtnAPPR.HorizontalAlignment = HorizontalAlignment.Left;
		BtnAPPR.VerticalAlignment = VerticalAlignment.Top;
        Grid.SetColumnSpan(BtnAPPR, 20);
        Grid.SetRowSpan(BtnAPPR, 1);
        Grid.SetColumn(BtnAPPR, 40);
        Grid.SetRow(BtnAPPR, 1);
        BtnAPPR.add_Click(OnClick);
        BtnAPPR.add_Unloaded(OnUnloaded);
        content.Children.Add(BtnAPPR)
                                                     debug.WriteLine(gLANG); 
        switch (gLANG) {
          case "GB":
          {
                                                       debug.WriteLine("content"); 
            BtnAPPR.Content = "Approve";
                                                         debug.WriteLine("he"); 
            if (vHeaderExists == true) {
                                             debug.WriteLine(vHeaderExists); 
              BtnAPPR.IsEnabled = false;
            }
            content.Children.Add(BtnAPPR);
            break;
          }
          default:
          {
                                                       debug.WriteLine("def"); 
            break;
          }
        }
      }
      catch(e){
      }
    }
//    catch(e){
//    }
//  }

    //=======================================================================================

    //   BtnAPPR.Click += delegate
    function OnClick(sender: Object, e: RoutedEventArgs) {
      try {
        vUpdMMTXID = false;
                                         gDebug.WriteLine(vTXID); 
        if (vTXID == "0") {
          //var outparms = new MIParameters {
          //  OutputFields = "TXID"
          //}
                                                   gDebug.WriteLine("8"); 
          
          var request = new MIRequest();
          request.Program = "CRS980MI";
          request.Transaction = "RtvNewTextID";
          //request.MIParameters = outparms;
          var record = new MIRecord();
          record["CONO"] = gCONO;
          record["TXID"] = vTXID;
          record["TXVR"] = "APPROVE";
          record["LNCD"] = gLANG;
          record["FILE"] = "MSYTXH";
          request.Record = record;

          gAPICompleted = false;
          MIWorker.Run(request, GTIOnCompleted);
          DoAPIWait(20);

          gDebug.WriteLine(vTXID); 

          if (vTXID == "0" || vTXID == "") {
          } else {
            vUpdMMTXID = true;
          }
        }
        if (vHeaderExists == false) {
        
                                                       gDebug.WriteLine("9"); 
                                                       gDebug.WriteLine(vTXID); 
                                                       gDebug.WriteLine(gCONO); 
                                                       gDebug.WriteLine(gITNO.Text); 
                                                       gDebug.WriteLine(gLANG); 
                                                       gDebug.WriteLine(gUSER); 
          var request = new MIRequest();
          request.Program = "CRS980MI";
          request.Transaction = "AddTxtBlockHead";
          var record = new MIRecord();
          record["CONO"] = gCONO;
          record["TXID"] = vTXID;
          record["TXVR"] = "APPROVE";
          record["LNCD"] = gLANG;
          record["TX40"] = "APPROVAL PROGRESS";
          record["TXEI"] = "2";
          record["FILE"] = "MITMAS00";
          record["KFLD"] = gITNO.Text;
          record["USID"] = gUSER;
          record["TFIL"] = "MSYTXH";
          request.Record = record;
          gAPICompleted = false;
          MIWorker.Run(request, ATBHOnCompleted);
          DoAPIWait(20);
                                                             gDebug.WriteLine("10"); 
        }
        if (vUpdMMTXID == true) {
          if (vTXID == "0" || vTXID == "") { 
          } else {
            //Now update the TXID on MITMAS...
            //var outparms = new MIParameters {
            //  OutputFields = "TXID"
            //}
            var request = new MIRequest();
            request.Program = "CRS980MI";
            request.Transaction = "SetTextID";
            //request.MIParameters = outparms;
            var record = new MIRecord();
            record["FILE"] = "MITMAS00";
            record["TXID"] = vTXID;
            record["KV01"] = gCONO;
            record["KV02"] = gITNO.Text;
            request.Record = record;
            gAPICompleted = false;
            MIWorker.Run(request, STIOnCompleted);
            DoAPIWait(20);
          }
        }
        if (vTXID == "0" || vTXID == "") { 
        } else {
          //Now Add TextBlock Line
          var request = new MIRequest();
          request.Program = "CRS980MI";
          request.Transaction = "AddTxtBlockLine";
          var record = new MIRecord();
          record["CONO"] = gCONO;
          record["TXID"] = vTXID;
          record["TXVR"] = "APPROVE";
          record["LNCD"] = gLANG;
          record["TX60"] = "Approval Process Started - " + gUSER;
          record["TFIL"] = "MSYTXH";
          request.Record = record;
          gAPICompleted = false;
          MIWorker.Run(request, ATBLOnCompleted);
          DoAPIWait(20);
        }
      }
      catch(e) { }
      if (PFTrigger.HasTriggerService) {
        // Trigger Services are available
        var service = "ITNOApproval";
        var product = "ERP";
        var dataArea = "LMDEVLPA";
        var category = "";
        var title = "New Item Approval" + gITNO.Text;
        var trigger = new PFTrigger(service, product, dataArea, category, title);
        trigger.AddVariable("TTXID", vTXID);
        trigger.AddVariable("TUSERID", gUSER);
        trigger.AddVariable("TITNO", gITNO.Text);
        trigger.AddVariable("TRESP", gRESP.Text);
        trigger.AddVariable("TITTY", gITTY.Text);
        trigger.AddVariable("TCONO", gCONO);
        trigger.AddVariable("TITDS", gITDS.Text);
        trigger.SubmitRequest(dataArea, OnTriggerCompleted);
        //controller.RenderEngine.ShowMessage("Item Approval IPA flow submitted.");
        //System.Windows.Forms.MessageBox.Show("Item Approval IPA flow submitted.");
      } else {
        // Trigger Services are not available
      }
      //refresh screen so that the txid change is picked up.
      try {
        gController.PressKey("F5");
      }
      catch(e) {
      }
    }

             		
    function OnUnloaded(sender: Object, e: RoutedEventArgs) {
      sender.remove_Unloaded(OnUnloaded);
	  sender.remove_Click(OnClick);
      sender = null;
    }
    
    function GTIOnCompleted(response: MIResponse) {
      try {
      
        vTXID = response.Items[0].GetString("TXID");
        gAPICompleted = true;
      }
      catch(e) {
        vTXID = "";
      }
    }
    
    function STBOnCompleted(response: MIResponse) {
      try {
        if (response.Items[0].Keys.Count > 0) {
          vHeaderExists = true;
        }
      }
      catch(e) {
      }
      gAPICompleted = true;
    }   
    
    
    function ATBHOnCompleted(response: MIResponse) {
      try {
        if (response.Items.Count > 0) {
          //vHeaderExists = true;
        }
      }
      catch(e) { 
      }
      gAPICompleted = true;
    }    
    
    function ATBLOnCompleted(response: MIResponse) {
      try {
        vLINO = "";
        vLINO = response.Item.GetString["LINO"];
      }
      catch(e) { 
      }
      gAPICompleted = true;
    }    
    
    
    function STIOnCompleted(response: MIResponse) {
      try {
        if (response.Items.Count > 0) {
          //'OK'
        } else {
          vTXID = "";
        }
        gAPICompleted = true;
      }
      catch(e) {
        vTXID = "";
      }
    }
    
    
    function DoAPIWait(vSecs) {
      //Cursor vCursor;
      vCursor = Cursor.Current;
      Cursor.Current = Cursors.WaitCursor;
      //DateTime vEnd;
      gNOW = DateTime.Now;
      vEnd = gNOW.AddSeconds(vSecs);
      while (gAPICompleted == false && gNOW < vEnd) {
        System.Windows.Forms.Application.DoEvents();
      }
      Cursor.Current = vCursor;
    }    
    

    
     function OnTriggerCompleted(args: PFTriggerEventArgs) {
       if (args != null && args.IsSuccessful) {
         //System.Windows.Forms.MessageBox.Show("Item Approval IPA flow submitted.");
         ConfirmDialog.ShowInformationDialog("Item Approval IPA flow submitted.", null); 
         /*
         args.Response.DetailMessage
         args.Response.ErrorCode
         args.Response.InformationCode
         args.Response.ReturnCode
         args.Response.ReturnData
         args.Response.Status
         args.Response.WorkunitNumber
         */
       } else {
       	ConfirmDialog.ShowInformationDialog("ProcessFlow Status", "Issue submitting Item Approval IPA flow : " + args.Response.DetailMessage, null); 
         //System.Windows.Forms.MessageBox.Show("Issue submitting Item Approval IPA flow : " + args.Response.DetailMessage);
       }
     }
               
    
  }
}
