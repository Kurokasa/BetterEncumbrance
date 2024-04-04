Hooks.on("init", function() {
    console.log("BetterEncumbrance | Initializing BetterEncumbrance");
});

// Toggles the weight of an item when it is equipped or unequipped
Hooks.on("preUpdateItem", (item, state) => {
    if(state.system == undefined || state.system.equipped == undefined || !(item.type == "equipment" || item.type == "weapon") )
        return;

    if(state.system.equipped != item.system.equipped && state.system.equipped == true)
    {
        item.setFlag("BetterEncumbrance", "oldWeight", item.system.weight);
        item.update({"system.weight": 0});
    }
    else if(state.system.equipped != item.system.equipped && state.system.equipped == false)
    {
        item.update({"system.weight": item.getFlag("BetterEncumbrance", "oldWeight")});
    }
});

// Updates the weight of a container when an item exceeds its weightless capacity
Hooks.on("updateItem", (item, state, change) => {
    if(state.system === undefined || state.system.container === undefined)
        return;
    
    const container = item.actor.items.get(state.system.container != null ? state.system.container : change.formerContainer.split(".").pop());
    if(!container.system.properties.has("weightlessContents") || container.system.capacity.type != "weight")
        return;

    let weight = 0 - container.system.capacity.value;
    for(let item of container.system.contents){
        weight += item.system.weight;
    }
    if(weight > 0)
        container.update({"system.weight": weight});
    else
        container.update({"system.weight": 0});
})