# ceng-407-408-2023-2024-Blast-Strike
Blast Strike

After the npm install part of the project. Change the this releated libary with this functions:
Go to CodeSrc -> blaststrike -> node_modules -> expo-location->build->Location.js
Then Change the these functions:
  export async function getHeadingAsync() with:
  export async function getHeadingAsync() {
    try {
        let tries = 0;
        let resolved = false;

        const promise = new Promise((resolve) => {
            // Declare subscription outside to capture it from watchHeadingAsync
            let subscription = null;

            // Create a function to handle heading updates
            const handleHeadingUpdate = (heading) => {
                if (heading.accuracy > 1 || tries > 5) {
                    if (!resolved && subscription) {
                        resolved = true;
                        subscription.remove();  // Clean up the subscription
                        resolve(heading);
                    }
                } else {
                    tries += 1;
                }
            };

            // Start watching the heading
            watchHeadingAsync(handleHeadingUpdate).then(sub => {
                subscription = sub;
            }).catch(error => {
                console.log('Failed to start watching heading:', error);
                resolve(null);  // Resolve with null if we cannot start the watch
            });
        });

        return promise;
    } catch (error) {
        console.log('Error in getHeadingAsync:', error);
        return null;  // Return null to signify failure
    }
}

and 

export async function watchHeadingAsync(callback) with:
export async function watchHeadingAsync(callback) {
    let watchId = null; // Initialize to null for safety

    try {
        watchId = HeadingSubscriber.registerCallback(callback);
        await ExpoLocation.watchDeviceHeading(watchId);
    } catch (error) {
        console.log('Failed to start watching device heading:', error);
        // Optionally handle the error, e.g., retry, fallback, or alert the user
    }

    // Always return an object with a 'remove' function
    return {
        remove() {
            if (watchId !== null) { // Only attempt to unregister if watchId is not null
                HeadingSubscriber.unregisterCallback(watchId);
            }
        },
    };
}


In there 

Internet Page: https://blaststrike.wordpress.com/2023/12/10/welcome-to-blast-strike-official-web-page/
