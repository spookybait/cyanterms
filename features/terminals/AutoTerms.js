import { S2DPacketOpenWindow, sendWindowClick, Prefix} from "../utils/utils"
import {registerWhen} from "../../../BloomCore/utils/Utils"
import Terminal from "../utils/terminalUtils"
import Settings from "../../config"

let LastClickTime
let clickedWindow = false
let firstClick

registerWhen(
    register("renderWorld", () => {      
          try {
              settings = Settings();
          } catch (error) {
              ChatLib.chat(Prefix + "Error in parsing Settings type /ct console js and send a screenshot of the error to Cyan")
          }
          let delay = (settings?.ClickDelay ?? 150);
          let fcDelay = (settings?.FirstClickDelay ?? 350);
          let breakThreshold = (settings?.BreakThreshold ?? 500); 
      
      
          
          if (firstClick && (Date.now() - LastClickTime < fcDelay)) return;
      
          if (Date.now() - LastClickTime < delay) return;
      
          if (Date.now() - LastClickTime > breakThreshold) {
              clickedWindow = false
          }
      
          if (!Terminal.isInTerm() || clickedWindow) return;
      
          
          const Solution = Terminal.getSolution()
          
          if (!Solution || !Solution.length) return;
      
          const currentClick = Solution.shift()    
          
      
          sendWindowClick(currentClick[0], currentClick[1], currentClick[2], 0)
		  
          LastClickTime = Date.now()
          clickedWindow = true
          firstClick = false
		  	try {
        new net.minecraft.network.play.server.S29PacketSoundEffect("note.pling", Player.getX(), Player.getY(), Player.getZ(), 1, 2).func_148833_a(Client.getConnection())
			} catch (e) { 
				console.log(e)
		}
      }), () => Terminal.isInTerm() && Settings().AutoTerm)


register("step", () => {
    if (!Terminal.isInTerm()) {
        firstClick = true
        LastClickTime = Date.now()
    }
})

register("packetReceived", () => {
    clickedWindow = false
}).setFilteredClass(S2DPacketOpenWindow)
