# ceng-407-408-2023-2024-Blast-Strike
Blast Strike

## Modifications

After installation, you'll need to make some modifications to the `expo-location` library used in the project.

### Modify `Location.js`

Navigate to the file at:
```
CodeSrc/blaststrike/node_modules/expo-location/build/Location.js
```

#### Update `getHeadingAsync`

Replace the existing `getHeadingAsync` function with the following:

```javascript
export async function getHeadingAsync() {
    try {
        let tries = 0;
        let resolved = false;
        const promise = new Promise((resolve) => {
            let subscription = null;

            const handleHeadingUpdate = (heading) => {
                if (heading.accuracy > 1 || tries > 5) {
                    if (!resolved && subscription) {
                        resolved = true;
                        subscription.remove(); // Clean up the subscription
                        resolve(heading);
                    }
                } else {
                    tries += 1;
                }
            };

            watchHeadingAsync(handleHeadingUpdate).then(sub => {
                subscription = sub;
            }).catch(error => {
                console.log('Failed to start watching heading:', error);
                resolve(null);  // Resolve with null on failure
            });
        });

        return promise;
    } catch (error) {
        console.log('Error in getHeadingAsync:', error);
        return null;  // Return null on error
    }
}
```

#### Update `watchHeadingAsync`

Replace the existing `watchHeadingAsync` function with the following:

```javascript
export async function watchHeadingAsync(callback) {
    let watchId = null; // Initialize to null for safety

    try {
        watchId = HeadingSubscriber.registerCallback(callback);
        await ExpoLocation.watchDeviceHeading(watchId);
    } catch (error) {
        console.log('Failed to start watching device heading:', error);
        // Optionally handle the error, e.g., retry, fallback, or alert the user
    }

    return {
        remove() {
            if (watchId !== null) {
                HeadingSubscriber.unregisterCallback(watchId);
            }
        },
    };
}
```

## Additional Information

For more details and updates, visit the official project webpage:
[Blast Strike Official Web Page](https://blaststrike.wordpress.com/2023/12/10/welcome-to-blast-strike-official-web-page/)


In there 

Internet Page: https://blaststrike.wordpress.com/2023/12/10/welcome-to-blast-strike-official-web-page/
