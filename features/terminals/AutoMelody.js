import Settings from "../../config"
import * as packetOpenWindow from "../events/packetOpenWindow";
import * as packetSetSlot from "../events/packetSetSlot";
import * as closeWindow from "../events/closeWindow";


// thanks soshimee

const C0EPacketClickWindow = Java.type("net.minecraft.network.play.client.C0EPacketClickWindow");

let inTerminal = false;
let cwid = -1;
const slots = [];
let windowSize = 0;




packetOpenWindow.addListener((title, windowId, _, slotCount) => {
	cwid = windowId;
	const melodyMatch = title.match(/^Click the button on time!$/);
	if (melodyMatch !== null) {
		if (!Settings().AutoMelody) return;
		inTerminal = true;
		while (slots.length) slots.pop();
		windowSize = slotCount;
	} else {
		inTerminal = false;
	}
});

closeWindow.addListener(() => {
	inTerminal = false;
});

packetSetSlot.addListener((itemStack, slot) => {
	if (!inTerminal) return;
	if (slot < 0) return;
	if (slot >= windowSize) return;
	if (itemStack !== null) {
		const item = new Item(itemStack);
		slots[slot] = {
			slot,
			id: item.getID(),
			meta: item.getMetadata(),
			size: item.getStackSize(),
			name: ChatLib.removeFormatting(item.getName()),
			enchanted: item.isEnchanted()
		};
		if (slots[slot].id === 160 && slots[slot].meta === 5) {
			const correct = slots.find(slot => slot && slot.id === 160 && slot.meta === 2)?.slot - 1;
			const button = Math.floor(slot / 9) - 1;
			const current = slot % 9 - 1;
			if (current !== correct) return;
			const buttonSlot = button * 9 + 16;

			Client.scheduleTask(0, () => {click(buttonSlot, 0);})
			if ((Settings().MelodySkip && (current === 0 || current === 4))) {
				if (button <= 3) Client.scheduleTask(1, () => {click(buttonSlot + 9, 0)})
				if (button <= 2) Client.scheduleTask(2, () => {click(buttonSlot + 18, 0)})
				if (button <= 1) Client.scheduleTask(3, () => {click(buttonSlot + 27, 0)})
			}
		}
	} else {
		slots[slot] = null;
	}
});


function click(slot, button) {
	if (slot === undefined || button === undefined) return;
	Client.sendPacket(new C0EPacketClickWindow(cwid, slot, button, 0, null, 0));
		try {
        new net.minecraft.network.play.server.S29PacketSoundEffect("note.pling", Player.getX(), Player.getY(), Player.getZ(), 1, 2).func_148833_a(Client.getConnection())
    } catch (e) { 
	console.log(e)
	}
}

