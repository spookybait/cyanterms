import { C0DPacketCloseWindow, C0EPacketClickWindow, Prefix, S2DPacketOpenWindow, S2EPacketCloseWindow, S2FPacketSetSlot, colorOrder, fixColorItemName } from "./utils"
import Settings from "../../config"
import { registerWhen } from "../../../BloomCore/utils/Utils";

let closeFuncs = [];
let openFuncs = [];

export const onOpenTerm = (openFunc) => {
    
    if (typeof openFunc === "function") {
        openFuncs.push(openFunc);
    }
};

export const onCloseTerm = (closeFunc) => {
    if (typeof closeFunc === "function") {
        closeFuncs.push(closeFunc);
    } 
};


const Terminals = {
    NUMBERS: {id: 0, regex: /^Click in order!$/, slotCount: 35},
    COLORS: {id: 1, regex: /^Select all the (.+?) items!$/, slotCount: 53},
    STARTSWITH: {id: 2, regex: /^What starts with: '(.+?)'\?$/, slotCount: 44},
    RUBIX: {id: 3, regex: /^Change all to same color!$/, slotCount: 44},
    REDGREEN: {id: 4, regex: /^Correct all the panes!$/, slotCount: 44},
    MELODY: {id: 5, regex: /^Click the button on time!$/, slotCount: 44},
}

export default new class Terminal {
    constructor() {
        this.inTerm = false
        this.currentItems = []
        this.shouldSolve = false
        this.initialOpen = 0
        this.terminalID = -1
        this.maxSlot = 999
        this.currentTitle = ""
        this.lastInteract = 0
        this.solutionLength = -1
        this.lastWindowID = -52345234532

        register("packetReceived", (packet, event) => {
            const windowTitle = packet.func_179840_c().func_150254_d().removeFormatting();
            this.currentTitle = windowTitle;
            let terminalFound = false;
            let term, id, regex, slotCount;
        
            for (let i of Object.entries(Terminals)) {
                [term, { id, regex, slotCount }] = i;
                let match = windowTitle.match(regex);
                if (!match) continue;
                terminalFound = true;
                break; 
            }
        
            if (terminalFound) {
                if (!this.inTerm) {
                    this.initialOpen = Date.now()
                    const currentGui = Client.getMinecraft().field_71462_r;
                    if (currentGui && currentGui.class.getName().includes("net.minecraft.client.gui.inventory")) { 
                        Client.getMinecraft().func_147108_a(null)
                    };
                    for (let openFunc of openFuncs) {
                        openFunc()
                    }
                }
                this.terminalID = id;
                this.maxSlot = slotCount;
                this.inTerm = true;
                this.currentItems = [];
                this.lastWindowID = packet.func_148901_c();
                this.shouldSolve = false;
            } else {
                this.inTerm = false;
                this._reloadTerm();
            }
        }).setFilteredClass(S2DPacketOpenWindow);

        register("worldLoad", () => {
            this.inTerm = false
            this._reloadTerm();
        })
        
        
        register("packetReceived", (packet, event) => {
            if (!this.inTerm || this.shouldSolve) return;
            
            const itemStack = packet.func_149174_e();
            const slot = packet.func_149173_d();
            const windowId = packet.func_149175_c();
            const ctItem = new Item(itemStack);

            if (windowId !== this.lastWindowID) return;
            if (slot > this.maxSlot) {
                this.shouldSolve = true
                return;
            };
            this.currentItems.push([windowId, slot, itemStack, ctItem])
        }).setFilteredClass(S2FPacketSetSlot)

        register("packetReceived", () => {
            if (!this.inTerm) return;
            this.inTerm = false
            ChatLib.chat(`${Prefix} &aTerminal &c${this.currentTitle} &acompleted in &c${(Date.now() - this.initialOpen) / 1000}s`);
            this._reloadTerm()
            Client.scheduleTask(1, () => {
                for (let closeFunc of closeFuncs) {
                    closeFunc()
                }
            })

        }).setFilteredClass(S2EPacketCloseWindow)

        // fc protection
        register("packetSent", (packet, event) => {
            if (!this.inTerm) return; 
            if (this.terminalID == 5) return;
            if (Date.now() - this.initialOpen < 350 || packet.func_149548_c() !== this.lastWindowID) cancel(event)
        }).setFilteredClass(C0EPacketClickWindow)

        register("packetSent", (packet, event) => {
            if (!this.inTerm) return; 
            if (this.terminalID == 5 && Settings().FirstSlotMelody && packet.func_149544_d() !== 16 && Date.now() - this.initialOpen < 400) cancel(event)
        }).setFilteredClass(C0EPacketClickWindow)

        register("packetSent", () => {
            if (!this.inTerm) return;
            this.inTerm = false
            this._reloadTerm()
        }).setFilteredClass(C0DPacketCloseWindow)

    }
    _reloadTerm() {
        this.currentItems = []
        this.shouldSolve = false
        this.initialOpen = 0
        this.terminalID = -1
        this.maxSlot = 999
        this.solutionLength = -1
        this.currentTitle = ""
        this.lastWindowID = -52345234532
        this.inTerm = false
    }


    getSolution() {
        if (!this.shouldSolve) return null
        let solution = []
        // [WindowID, Slot, ClickType]

        switch (this.terminalID) {
            case Terminals.NUMBERS.id:

                let filteredItems = this.currentItems.filter(item => item[3].getMetadata() === 14).sort((a, b) => a[3].getStackSize() - b[3].getStackSize());
                solution = filteredItems.map(item => [item[0], item[1], 0]);
                break;

            case Terminals.COLORS.id:

                let color = this.currentTitle.match(/Select all the (.+) items!/)[1].toLowerCase()
                if (!color) return;

                solution = this.currentItems.filter(item => {
                    if (!item[3] || item[3].isEnchanted()) return false;
                    const fixedName = fixColorItemName(item[3].getName().removeFormatting().toLowerCase());
                    return fixedName.startsWith(color);
                }).map(item => [item[0], item[1], 0]);

            break;

            case Terminals.STARTSWITH.id:
                let match = this.currentTitle.match(/What starts with: '(\w+)'?/);
            
                if (!match) return;
            
                let matchLetter = match[1].toLowerCase();
            
                solution = this.currentItems.filter(item => item[3].getName().toLowerCase().removeFormatting().startsWith(matchLetter) && !item[3].isEnchanted()).map(item => [item[0], item[1], 0]);
            
                break;
                



            case Terminals.RUBIX.id:
                    let rubixItems = this.currentItems.filter(item => item[3].getMetadata() !== 15 && item[3].getID() === 160);
                    let minIndex = -1;
                    let minTotal = Infinity;

                
                    for (let targetIndex = 0; targetIndex < 5; targetIndex++) {
                        let totalClicks = 0;
                
                        for (let i = 0; i < rubixItems.length; i++) {
                            let currentMetadata = rubixItems[i][3].getMetadata();
                            let currentIndex = colorOrder.indexOf(currentMetadata);
                            let clockwiseClicks = (targetIndex - currentIndex + colorOrder.length) % colorOrder.length;
                            let counterclockwiseClicks = (currentIndex - targetIndex + colorOrder.length) % colorOrder.length;
                            totalClicks += Math.min(clockwiseClicks, counterclockwiseClicks);
                        }
                
                        if (totalClicks < minTotal) {
                            minTotal = totalClicks;
                            minIndex = targetIndex;
                        }
                    }
                
                    for (let i = 0; i < rubixItems.length; i++) {
                        let item = rubixItems[i];
                        let currentMetadata = item[3].getMetadata();
                        let currentIndex = colorOrder.indexOf(currentMetadata);
                
                        let clockwiseClicks = (minIndex - currentIndex + colorOrder.length) % colorOrder.length;
                        let counterclockwiseClicks = (currentIndex - minIndex + colorOrder.length) % colorOrder.length;
                
                        if (clockwiseClicks <= counterclockwiseClicks) {
                            for (let j = 0; j < clockwiseClicks; j++) {
                                solution.push([item[0], item[1], 0]);
                            }
                        } else {
                            for (let j = 0; j < counterclockwiseClicks; j++) {
                                solution.push([item[0], item[1], 1]);
                            }
                        }
                    }
                
                    break;
                
                

            case Terminals.REDGREEN.id:
                solution = this.currentItems.filter(item => item[3].getMetadata() === 14).map(item => [item[0], item[1], 0]);
                break;

            default:
                break
        }

        this.solutionLength = solution.length
        return solution
        

    }

    isInTerm() {
        return this.inTerm
    }

}
