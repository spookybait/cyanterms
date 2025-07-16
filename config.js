// Make sure these go to the right directory 
import Settings from "../Amaterasu/core/Settings"
import DefaultConfig from "../Amaterasu/core/DefaultConfig"
const config = new DefaultConfig("CyanTerms", "data/settings.json")

config
.addSwitch({
    category: "Terminals",
    configName: "AutoTerm",
    title: "Auto Terms",
    description: "Automatically completes terminals for you",
    subcategory: "Auto"
})
.addSlider({
    category: "Terminals",
    configName: "ClickDelay",
    title: "Click Delay",
    description: "Delay in ms terminals",
    subcategory: "Auto",
    options: [50, 300],
    value: 140
})
.addSlider({
    category: "Terminals",
    configName: "FirstClickDelay",
    title: "First Click Delay",
    description: "First click delay",
    subcategory: "Auto",
    options: [300, 500],
    value: 310
})
.addSlider({
    category: "Terminals",
    configName: "BreakThreshold",
    title: "Break Threshold",
    description: "Fix time",
    subcategory: "Auto",
    options: [500, 1500],
    value: 500
})
.addSwitch({
    category: "Terminals",
    configName: "ForceP3",
    title: "Force P3",
    description: "Will disregard in P3 checks",
    subcategory: "General"
})
.addSwitch({
    category: "Terminals",
    configName: "AutoMelody",
    title: "Melody",
    description: "Toggle Auto Melody",
    subcategory: "Melody"
})
.addSwitch({
    category: "Terminals",
    configName: "MelodySkip",
    title: "Melody",
    description: "Toggle Auto Melody Skip",
    subcategory: "Melody"
})
.addSwitch({
    category: "Terminals",
    configName: "FirstSlotMelody",
    title: "First Slot Melody",
    description: "Don't skip on the first slot of Melody",
    subcategory: "Melody"
})

const setting = new Settings("CyanTerms", config, "data/scheme-nwjn.json") // make sure to set your command with [.setCommand("commandname")]

export default () => setting.settings