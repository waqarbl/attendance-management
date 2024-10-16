
const handlePrismaError = (error) => {
    if (error.code === "P2002") {
      return {
        status: 400,
        message: `A record with this ${error.meta.target} already exists.`,
      };
    }
  
    if (error.code === "P2025") {
      return {
        status: 404,
        message: `The requested record was not found.`,
      };
    }
  
    if (error.code === "P2003") {
      return {
        status: 400,
        message: `Foreign key constraint failed on field: ${error.meta.field_name}`,
      };
    }
  
    if (error.code === "P2000") {
      return {
        status: 400,
        message: `The value for field ${error.meta.field_name} is too long.`,
      };
    }
  
    if (error.code === "P2011") {
      return {
        status: 400,
        message: `Missing required value for field: ${error.meta.field_name}`,
      };
    }
  
    if (error.code === "P2004") {
      return {
        status: 400,
        message: `Invalid argument provided for the query.`,
      };
    }
  
    if (error.code === "P2014") {
      return {
        status: 400,
        message: `Relation violation occurred during the operation.`,
      };
    }
  
    if (error.code === "P2012") {
      return {
        status: 400,
        message: `Data validation error: ${error.meta.error_message}`,
      };
    }
  
    if (error.code === "P2024") {
      return {
        status: 503,
        message: `The operation timed out, please try again later.`,
      };
    }
  
    return {
      status: 500,
      message: "An unexpected error occurred, please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : null,
    };
  };
  
  module.exports = handlePrismaError;
  