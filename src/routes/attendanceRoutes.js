const express = require("express");
const moment = require("moment");
require("moment-duration-format");
const {
  authenticateToken,
  isUserInOrganization,
} = require("../middlewares/auth");
const prisma = require("../../prisma/client");
const router = express.Router();
const handlePrismaError = require("../utils/errorHandler");

// Check In / if again then update previous
// router.post(
//   "/check-in",
//   authenticateToken,
//   isUserInOrganization,
//   async (req, res) => {
//     try {
//       const expectedSignIn = process.env.EXPECTED_SIGN_IN || "09:15";
//       const signInTime = new Date();

//       const isLate = moment(signInTime).isAfter(
//         moment(expectedSignIn, "HH:mm")
//       );
//       const lateDuration = isLate
//         ? moment(signInTime).diff(moment(expectedSignIn, "HH:mm"), "minutes")
//         : 0;

//       const formattedLateDuration = isLate ? formatDuration(lateDuration) : "0";

//       const today = moment().format("YYYY-MM-DD");

//       let attendance = await prisma.attendance.findFirst({
//         where: {
//           userId: req.user.id,
//           date: {
//             gte: moment(today).startOf("day").toDate(),
//             lte: moment(today).endOf("day").toDate(),
//           },
//         },
//       });

//       if (attendance) {
//         attendance = await prisma.attendance.update({
//           where: { id: attendance.id },
//           data: {
//             signInTime,
//             isLate,
//             lateDuration: formattedLateDuration,
//           },
//         });
//         res.status(200).json({ message: "Attendance updated", attendance });
//       } else {
//         attendance = await prisma.attendance.create({
//           data: {
//             userId: req.user.id,
//             signInTime,
//             isLate,
//             lateDuration: formattedLateDuration,
//           },
//         });
//         res.status(201).json({ message: "Attendance marked", attendance });
//       }
//     } catch (error) {
//       const { status, message } = handlePrismaError(error);
//       console.error("Error during operation:", error);
//       return res.status(status).json({ message });
//     }
//   }
// );

// Check In once in a day
router.post(
  "/check-in",
  authenticateToken,
  isUserInOrganization,
  async (req, res) => {
    try {
      const expectedSignIn = process.env.EXPECTED_SIGN_IN || "09:15";
      const signInTime = new Date();

      const isLate = moment(signInTime).isAfter(
        moment(expectedSignIn, "HH:mm")
      );
      const lateDuration = isLate
        ? moment(signInTime).diff(moment(expectedSignIn, "HH:mm"), "minutes")
        : 0;

      const formattedLateDuration = isLate ? formatDuration(lateDuration) : "0";

      const today = moment().format("YYYY-MM-DD");

      let attendance = await prisma.attendance.findFirst({
        where: {
          userId: req.user.id,
          date: {
            gte: moment(today).startOf("day").toDate(),
            lte: moment(today).endOf("day").toDate(),
          },
        },
      });

      if (attendance) {
        return res
          .status(400)
          .json({ message: "You have already checked in today." });
      }

      attendance = await prisma.attendance.create({
        data: {
          userId: req.user.id,
          signInTime,
          isLate,
          lateDuration: formattedLateDuration,
        },
      });

      res.status(201).json({ message: "Attendance marked", attendance });
    } catch (error) {
      const { status, message } = handlePrismaError(error);
      console.error("Error during operation:", error);
      return res.status(status).json({ message });
    }
  }
);

// Check Out
router.post(
  "/check-out",
  authenticateToken,
  isUserInOrganization,
  async (req, res) => {
    try {
      const expectedSignOut = moment(
        process.env.EXPECTED_SIGN_OUT || "18:30",
        "HH:mm"
      );
      const currentTime = moment();

      const today = moment().format("YYYY-MM-DD");

      let attendance = await prisma.attendance.findFirst({
        where: {
          userId: req.user.id,
          date: {
            gte: moment(today).startOf("day").toDate(),
            lte: moment(today).endOf("day").toDate(),
          },
        },
      });

      if (!attendance) {
        return res.status(400).json({
          message: "You must check-in first before checking out.",
        });
      }

      const isEarlyLeave = currentTime.isBefore(expectedSignOut);
      const earlyLeaveDuration = isEarlyLeave
        ? expectedSignOut.diff(currentTime, "minutes")
        : 0;

      const formattedEarlyLeaveDuration = formatDuration(earlyLeaveDuration);

      attendance = await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          signOutTime: currentTime.toDate(),
          isEarlyLeave,
          earlyLeaveDuration: formattedEarlyLeaveDuration,
        },
      });

      res.status(200).json({
        message: "Check-out successful",
        attendance,
      });
    } catch (error) {
      const { status, message } = handlePrismaError(error);
      console.error("Error during operation:", error);
      return res.status(status).json({ message });
    }
  }
);

const formatDuration = (minutes) => {
  const duration = moment.duration(minutes, "minutes");
  return duration.format("h [hours] m [minutes]", { trim: "both" });
};

module.exports = router;
