import Settings from "./config";

import "./features/terminals/AutoTerms"
import "./features/terminals/AutoMelody"

register("command", () => {
    Settings().getConfig().openGui()

}).setName("cyanterms");


