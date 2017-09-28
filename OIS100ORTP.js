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
	class OIS100ORTP {
		var controller : Object;
		var content : Object;
		var gRSCD : String = "";

   		public function Init(element: Object, args: Object, pcontroller : Object, debug : Object) {
      		this.controller = pcontroller;
			content = controller.RenderEngine.Content;
			gRSCD = ScriptUtil.FindChild(content, "WBRSCD").Text;
			if (gRSCD != "") {
        		InstanceCache.Add(controller, "RSCD", gRSCD);
        	} else {
        	    var tRSCD = InstanceCache.Get(controller, "RSCD");
        	    gRSCD = tRSCD; 
        	}
    	}
  	}
}
