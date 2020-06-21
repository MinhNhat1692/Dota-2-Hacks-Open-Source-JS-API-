
 function ForceStaffRangeRadiusF(){
    var a=550
           var MyEnt = Players.GetPlayerHeroEntityIndex( Game.GetLocalPlayerID() )
           Corona.Particles.ForceStaffRangeRadius = ParticleManager.CreateParticle("particles/ui_mouseactions/range_display.vpcf", ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW , MyEnt)
           Particles.SetParticleControl(Corona.Particles.ForceStaffRangeRadius, 1, [a,0,0])
   }
   function Destroy(): void {
       ParticleManager.DestroyParticleEffect(Corona.Particles.ForceStaffRangeRadius.get(a), true)
       Corona.Particles.ForceStaffRangeRadius.delete(a)
   }  
   module = {
       name: "Forcestaff Range",
       onToggle: checkbox => {
           if (checkbox.checked) {
            ForceStaffRangeRadiusF()
               Utils.ScriptLogMsg("Script enabled: ForceStaff Range", "#00ff00")
           } else {
               Destroy()
               module.onDestroy()
   
               Utils.ScriptLogMsg("Script disabled: ForceStaff  Range", "#ff0000")
           }
       },
       onDestroy: () => Corona.OnTick.remove(Destroy)
   }
   
   