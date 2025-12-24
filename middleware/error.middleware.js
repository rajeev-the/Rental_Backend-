const errorhandler = (err,req,res,next)=>{

    console.log("Error Middleware:",err);

    //defulat to 500 server error
    let statusCode = 500;
    let message = "Internal Server Error";

     // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // Handle duplicate key error (Mongo error code 11000)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue);
    message = `${field} must be unique`;
  }

  // Handle Mongoose bad ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;

  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token. Please log in again.";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired. Please log in again.";
  }


  return res.status(statusCode).json({
    success:false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,

  })

}