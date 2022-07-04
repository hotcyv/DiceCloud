export default function getSlotFillFilter({slot, libraryIds}){
  let filter = {
    removed: {$ne: true},
    $and: []
  };
  if (libraryIds){
    filter['ancestors.id'] = {$in: libraryIds};
  }
  if (slot.slotType){
    filter.$and.push({
      $or: [{
        type: slot.slotType
      },{
        type: 'slotFiller',
        slotFillerType: slot.slotType,
      }]
    });
  } else if (slot.type === 'class') {
    filter.$and.push({
      $or: [{
        type: 'classLevel',
      },{
        type: 'slotFiller',
        slotFillerType: 'classLevel',
      }]
    });
    filter.variableName = slot.variableName;

    // Only search for levels the class needs
    const levels = [];
    if (slot.missingLevels && slot.missingLevels.length) {
      levels.push(...slot.missingLevels);
    } else if (slot.level) {
      levels.push(slot.level);
    }
    if (levels.length) {
      filter.level = {$or: levels};
    }
  }
  let tagsOr = [];
  let tagsNin = [];
  if (slot.slotTags && slot.slotTags.length){
    tagsOr.push({tags: {$all: slot.slotTags}});
  }
  if (slot.extraTags && slot.extraTags.length){
    slot.extraTags.forEach(extra => {
      if (!extra.tags || !extra.tags.length) return;
      if (extra.operation === 'OR'){
        tagsOr.push({tags: {$all: extra.tags}});
      } else if (extra.operation === 'NOT'){
        tagsNin.push(...extra.tags);
      }
    });
  }
  if (tagsOr.length){
    filter.$and.push({$or: tagsOr});
  }
  if (tagsNin.length){
    filter.$and.push({$nin: tagsNin});
  }
  if (!filter.$and.length){
    delete filter.$and;
  }
  return filter;
}
