function FOWFIX(): void {
    Utils.UnrestrictedCmd("fog_enable 0")
    Utils.UnrestrictedCmd("r_farz 20000")
    Utils.UnrestrictedCmd("dota_use_particle_fow 0")
    
}


module = {
name: "FOW Fix",
onToggle: checkbox => {
    if (checkbox.checked) {
        Fusion.OnTick.push(FOWFIX)
       
        Utils.ScriptLogMsg("Script enabled: FOW FIX", "#00ff00")
    } else {
        Fusion.OnTick.remove(FOWFIX)
        Utils.ScriptLogMsg("Script disabled: FOW FIX", "#ff0000")
    }
},
onDestroy: () => Fusion.OnTick.remove(FOWFIX)
}