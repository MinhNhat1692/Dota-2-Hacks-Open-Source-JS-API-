var NoTarget: number[] = [],
	EzTechiesAuto_config = { // do not edit this unless you know what you're doing!
		safe_mode: true,
		use_prediction: false
	},
	BlowDelay = 0.25

function CallMinesFS(techies: Entity, ent: Entity, callback: Function, explosionCallback: Function): void {
	var TargetHP = ent.HealthAfter(EzTechies.blowDelay),
		RMinesToBlow = [],
		RMinesDmg = 0

	EzTechies.RMines.filter(([rmine]) => callback(techies, ent, rmine)).every(([rmine, dmg]) => {
		RMinesToBlow.push(rmine)
		RMinesDmg += dmg
		var theres = ent.CalculateDamage(RMinesDmg, DAMAGE_TYPES.DAMAGE_TYPE_MAGICAL)
		if(TargetHP < theres) {
			if(Corona.debug)
				$.Msg("EzTechiesAuto", `There's ${theres}, needed ${TargetHP} for ${ent.UnitName}`)
			explosionCallback(techies, ent, RMinesToBlow, RMinesDmg)
			return false
		} else return !TryDagonFS(techies, ent, RMinesDmg, DAMAGE_TYPES.DAMAGE_TYPE_MAGICAL)
	})
}

/**
 * Tries dagon
 * @param techies entity that'll output damage
 * @param ent entity that'll receive damage
 * @param damage damage that we already have
 * @param damage_type damage type that we already have
 * @returns used dagon or not
 */
function TryDagonFS(techies: Entity, ent: Entity, damage: number = 0, damage_type: number = DAMAGE_TYPES.DAMAGE_TYPE_NONE): boolean {
	var Dagon = techies.ItemByName(/item_dagon/),
		TargetHP = ent.HealthAfter(EzTechies.blowDelay)
	if(Dagon)
		if(Dagon.CooldownTimeRemaining === 0 && TargetHP < ent.CalculateDamage(Dagon.SpecialValueFor("damage"), DAMAGE_TYPES.DAMAGE_TYPE_MAGICAL) + ent.CalculateDamage(damage, damage_type) && techies.IsEntityInRange(ent, Dagon.CastRange)) {
			Orders.CastTarget(techies, Dagon, ent, false)
			return true
		}

	return false
}

function DenyMinesFS(): void {
	EzTechies.RMines.forEach(([rmine]) => {
		if(rmine.HealthPercent === 100)
			return
		if(!rmine.IsAlive) {
			EzTechies.RemoveRMine(rmine)
			return
		}
	//	Orders.CastNoTarget(rmine, rmine.AbilityByName("techies_remote_mines_self_detonate"), false)
	})
}

function NeedToTriggerMine(rmine: Entity, ent: Entity, forcestaff: boolean = false): boolean {
	var TriggerRadius = EzTechies.TriggerRadius
	if(EzTechiesAuto_config.safe_mode)
		TriggerRadius -= ent.Speed * (EzTechies.blowDelay / 30)
	
	return EzTechiesAuto_config.use_prediction
		? ent.InFront((ent.Speed_IsMoving * BlowDelay) + (forcestaff ? Corona.ForceStaffUnits : 0)).PointDistance(rmine.AbsOrigin) <= TriggerRadius
		: forcestaff
			? rmine.AbsOrigin.PointDistance(ent.ForceStaffPos) <= TriggerRadius
			: rmine.IsEntityInRange(ent, TriggerRadius)
}

function RemoteMinesFS(techies: Entity, HEnts: Entity[]): void {
	if(techies.AbilityByName("techies_remote_mines").Level === 0 || EzTechies.RMines.length === 0)
		return
	HEnts.filter(ent =>
		ent.MagicMultiplier !== 0
		&& NoTarget.indexOf(ent.id) < 0
	).forEach(ent => {
		var callbackCalled = false
		CallMinesFS (
			techies, ent,
			(techies, ent, rmine) => NeedToTriggerMine(rmine, ent),
			(techies, ent, RMinesToBlow) => {
				callbackCalled = true
			//	RMinesToBlow.forEach(rmine => Orders.CastNoTarget(rmine, rmine.AbilityByName("techies_remote_mines_self_detonate"), false))
		//		NoTarget.push(ent.id)
		//		$.Schedule(EzTechies.blowDelay / 30, () => NoTarget.remove(ent.id))
			}
		)

		var force = techies.ItemByName("item_force_staff")
		if (
			!callbackCalled && force !== undefined && techies.IsAlive && force.CooldownTimeRemaining === 0
			&& techies.IsEntityInRange(ent, force.CastRange)
		)
			CallMinesFS (
				techies, ent,
				(techies, ent, rmine) => NeedToTriggerMine(rmine, ent, true),
				(techies, ent) => Orders.CastTarget(techies, force, ent, false)
			)
	})
}

function EzTechiesFFS(): void {
	const techies = EzTechies.Techies
	if(techies === undefined || techies.IsEnemy) {
		Corona.OnTick.remove(EzTechiesFFS)
		Utils.ScriptLogMsg("[EzTechiesAuto] Isn't techies, also don't have one in team", "#ff0000")
		return
	}
	var HEnts = Array.prototype.orderBy.call(EntityManager.PlayersHeroEnts().filter(ent => ent.IsAlive && ent.IsEnemy), ent => ent.Health)

	RemoteMinesFS(techies, HEnts)
	DenyMinesFS()
}

module = {
    name: "Techies Forcestaff",
    onPreload: () => Corona.GetConfig("EzTechiesAuto").then(config => EzTechiesAuto_config = config),
	onToggle: checkbox => {
		if (checkbox.checked) {
			Corona.OnTick.push(EzTechiesFFS)
			Utils.ScriptLogMsg("Script enabled: EzTechiesAuto", "#00ff00")
		} else {
			Corona.OnTick.remove(EzTechiesFFS)
			Utils.ScriptLogMsg("Script disabled: EzTechiesAuto", "#ff0000")
		}
	},
	onDestroy: () => Corona.OnTick.remove(EzTechiesFFS)
}