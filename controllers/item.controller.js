import User from "../model/User.js";
import Item from "../model/Item.js";

export const createItem = async (req,res)=>{

    const {
    title,
    description,
    photos,
    category,
    condition,
    pricePerDay,
    deposit,

    } = req.body;

   


    if(!title || !category || !pricePerDay){
        return res.status(400).json({message:"Title, Category and Price Per Day are required"});
    }

    if(!photos || !Array.isArray(photos) || photos.length ===0){
        return res.status(400).json({message:"At least one photo is required"});
    }

      // Create item
  const item = await Item.create({
    ownerId: req.user.userId,
    title,
    description,
    photos,
    category,
    condition,
    pricePerDay,
    deposit,
    location: {
      hostelBlock: req.user.hostelBlock,
    },
  });

    // Increment listing count
  await User.findByIdAndUpdate(req.user.id, {
    $inc: { listingsCount: 1 },
  });

   res.status(201).json({
    success: true,
    message: "Item created successfully",
    item,
  });
  
}


export const getAllItems = async(req,res)=>{
    const {category,search} = req.query;

    const filer ={ status:"available" };

    if(category){
        filer.category = category;
    }
    
    if(search){
        filer.title = {$regex:search, $options:"i"};
    }

    const items = await Item.find(filer);

    res.status(200).json({
    success: true,
    count: items.length,
    items,
  });

}

export const getMyItems = async (req, res) => {
  const items = await Item.find({ ownerId: req.user.userId });

  res.status(200).json({
    success: true,
    items,
  });
};


export const getItemById = async (req, res) => {
  const item = await Item.findById(req.params.id).populate(
    "ownerId",
    "name hostelBlock trustScore"
  );

  if (!item) {
    return res.status(404).json({
      success: false,
      message: "Item not found",
    });
  }

  res.status(200).json({
    success: true,
    item,
  });
};



export const updateItem = async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    return res.status(404).json({
      success: false,
      message: "Item not found",
    });
  }

  if (item.ownerId.toString() !== req.user.userId) {
    return res.status(403).json({
      success: false,
      message: "You are not allowed to update this item",
    });
  }

  const allowedFields = [
    "title",
    "description",
    "photos",
    "category",
    "condition",
    "pricePerDay",
    "deposit",
    "status",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      item[field] = req.body[field];
    }
  });

  await item.save();

  res.status(200).json({
    success: true,
    message: "Item updated successfully",
    item,
  });
};



export const deleteItem = async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    return res.status(404).json({
      success: false,
      message: "Item not found",
    });
  }

  if (item.ownerId.toString() !== req.user.userId) {
    return res.status(403).json({
      success: false,
      message: "You are not allowed to delete this item",
    });
  }

  await item.deleteOne();

  res.status(200).json({
    success: true,
    message: "Item deleted successfully",
  });
};



