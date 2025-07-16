
const S2FPacketSetSlot = Java.type("net.minecraft.network.play.server.S2FPacketSetSlot");

const listeners = [];

const trigger = register("packetReceived", (packet, event) => {
	const itemStack = packet.func_149174_e();
	const slot = packet.func_149173_d();
	const windowId = packet.func_149175_c();
	
	for (let listener of listeners) {
		listener(itemStack, slot, windowId, packet, event);
	}
}).setFilteredClass(S2FPacketSetSlot).unregister();

export function addListener(listener) {
	if (listeners.length === 0) trigger.register();
	listeners.push(listener);
}

export function removeListener(listener) {
	const index = listeners.indexOf(listener);
	if (index === -1) return false;
	listeners.splice(index, 1);
	if (listeners.length === 0) trigger.unregister();
	return true;
}
