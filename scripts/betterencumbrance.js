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
    if(state.system.container === undefined && (item.system.container == null || (state.system.weight === undefined && state.system.quantity === undefined)) )
        return;
    
    const container = item.actor.items.get(item.system.container != null ? item.system.container : change.formerContainer.split(".").pop());
    if(!container.system.properties.has("weightlessContents") || container.system.capacity.type != "weight")
        return;

    updateContainerWeight(container);
})

// Updates the weight of the container if its properties are changed
Hooks.on("updateItem", (item, state) => {
    if(item.type != "container")
        return;
    if(state.system.properties != undefined && state.system.properties.includes("weightlessContents")){
        updateContainerWeight(item);
        return;
    }
    else if(state.system.properties != undefined && !item.system.properties.has("weightlessContents")){
        item.update({"system.weight": 0});
        return;
    }
    else if(state.system.currency === undefined && state.system.capacity === undefined)
        return;
    updateContainerWeight(item);
})

// Updates the weight of a container when an item is deleted from it
Hooks.on("deleteItem", (item) => {
    if(item.system == undefined || item.system.container == null) 
        return;
    updateContainerWeight(item.actor.items.get(item.system.container));
})

function updateContainerWeight(container){
    let weight = 0 - container.system.capacity.value;
    let coinweight = 1 / CONFIG.DND5E.encumbrance.currencyPerWeight.imperial;

    for(let item of container.system.contents){
        weight += item.system.weight * item.system.quantity;
    }
    for (coin in container.system.currency){
        weight += container.system.currency[coin] * coinweight;
    }

    if(weight > 0)
        container.update({"system.weight": weight});
    else
        container.update({"system.weight": 0});
}