
const axios = require('axios');

// Generate a JWT Token for Zoom API
const generateZoomJWT = () => {
  const payload = {
    iss: process.env.ZOOM_API_KEY,
    exp: new Date().getTime() + 5000
  };

  // In a production environment, you'd use a proper JWT library
  // For this example, we're simulating the token
  return `zoom_jwt_token_${payload.iss}_${payload.exp}`;
};

// Create a Zoom Meeting
exports.createZoomMeeting = async (topic, startTime, durationMinutes, doctorName, patientName) => {
  try {
    const token = generateZoomJWT();
    
    // In a real implementation, this would be an actual API call to Zoom
    // For this example, we're simulating the response
    const meetingResponse = {
      id: Math.floor(Math.random() * 1000000000).toString(),
      password: Math.random().toString(36).substring(2, 8),
      join_url: `https://zoom.us/j/${Math.floor(Math.random() * 1000000000)}?pwd=${Math.random().toString(36).substring(2, 8)}`,
      start_url: `https://zoom.us/s/${Math.floor(Math.random() * 1000000000)}?pwd=${Math.random().toString(36).substring(2, 8)}`
    };

    return {
      meetingId: meetingResponse.id,
      password: meetingResponse.password,
      joinUrl: meetingResponse.join_url,
      hostUrl: meetingResponse.start_url,
      topic,
      startTime,
      duration: durationMinutes
    };
  } catch (error) {
    console.error('Error creating Zoom meeting:', error);
    throw new Error('Failed to create Zoom meeting');
  }
};

// Schedule a Zoom Meeting for an appointment
exports.scheduleZoomMeeting = async (appointment, doctorName, patientName) => {
  const topic = `Medical Consultation: Dr. ${doctorName}${patientName ? ` with ${patientName}` : ''}`;
  
  // Format appointment time for Zoom API
  const startTime = new Date(appointment.date);
  const [hours, minutes] = appointment.startTime.split(':');
  startTime.setHours(parseInt(hours), parseInt(minutes), 0);
  
  // Calculate duration in minutes
  const [endHours, endMinutes] = appointment.endTime.split(':');
  const endTime = new Date(appointment.date);
  endTime.setHours(parseInt(endHours), parseInt(endMinutes), 0);
  
  const durationMinutes = (endTime - startTime) / (1000 * 60);
  
  return this.createZoomMeeting(topic, startTime.toISOString(), durationMinutes, doctorName, patientName);
};

// Send email notification for a Zoom meeting
exports.sendZoomMeetingNotification = async (recipientEmail, recipientName, meetingDetails, isDoctor = false) => {
  try {
    // In a real implementation, this would call an email service
    // For this example, we're just logging the notification details
    console.log(`[EMAIL] Meeting notification sent to ${recipientName} (${recipientEmail})`);
    console.log(`[EMAIL] Meeting link: ${isDoctor ? meetingDetails.hostUrl : meetingDetails.joinUrl}`);
    console.log(`[EMAIL] Meeting ID: ${meetingDetails.meetingId}`);
    console.log(`[EMAIL] Meeting Password: ${meetingDetails.password}`);
    console.log(`[EMAIL] Meeting Time: ${new Date(meetingDetails.startTime).toLocaleString()}`);
    
    return true;
  } catch (error) {
    console.error('Error sending meeting notification:', error);
    return false;
  }
};
