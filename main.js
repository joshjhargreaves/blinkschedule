import axiosClient from "axios";
import usercredentials from "./usercredentials.json";
import log from "log-to-file";

const makeLogger = (name) => {
    return {
        INFO: function(logline) {
            console.log(`${name}: ${logline}`);
            log(`INFO ${name}: ${logline}`);
        },
        WARN: function(logline) {
            console.warn(`${name}: ${logline}`);
            log(`WARN ${name}: ${logline}`);
        },
        ERROR: function(logline) {
            console.error(`${name}: ${logline}`);
            log(`ERROR ${name}: ${logline}`);
        }
    }
}

const axios = axiosClient.create({baseURL: "https://uzkvhe2t35.execute-api.us-west-2.amazonaws.com/prod"})

usercredentials.forEach(async credentials => {
    const logger = makeLogger(credentials.name);

    logger.INFO(`Starting reservation process`);

    const options = {
        headers: {
            'accept': '*/*',
            'content-type': 'application/json',
            'x-blink-app-version': '2.24.0',
            'x-api-key': 'nPFjzhoIsK3GIP52G7Xqx9KCozCg6HmS8VbhSmYD',
            'user-agent': 'Blink Fitness/2.24.0 (iPhone; iOS 14.2; Scale/2.00)',
            'accept-language': 'en-US;q=1',
        }
    }
    let response;
    try {
        response = await axios.post('/auth/login', credentials.loginDetails, options);
    } catch(e) {
        logger.INFO('Failed to login');
        return;
    }
        
    const { data } = response;
    const { token } = data;

    options.headers.authorization = `Bearer ${token}`;

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    
    // Blink only lets us book 2 days in advance
    for (let i=0; i<3; ++i) {
        date.setDate(currentDate.getDate() + i);
        
        const desiredTime = credentials.reservations[date.getDay().toString()];
        if (desiredTime) {
            const time = date.getTime() / 1000;
            
            try {
                response = await axios.get(`/reservations/slots?businessUnitCode=${credentials.businessUnitCode}&date=${time}`, options);
            } catch(e) {
                logger.ERROR('Could not get reservation slots');
                return;
            }
            const slot = response.data.slots.find(slot => slot.startTime === desiredTime);
            if (!slot) {
                logger.WARN(`slot exists for ${desiredTime}`);
                continue;
            }
            if (slot.remainingSpots == 0) {
                logger.ERROR('Not enough slots to make reservation');
                return;
            }
            if (slot) {
                const { eventInstanceId } = slot;
                try {
                    response = await axios.post(`/reservations/register`, { eventInstanceId }, options)
                } catch(e) {
                    logger.WARN(`Could not reserve ${desiredTime}`);
                    return;
                }

                logger.INFO(`Successfully reserved ${desiredTime}`);
            }
        }
    }
})

export default {};