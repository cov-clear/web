# Cov-Clear web client #

The cov clear web application is designed to securely manage:
* The administration of covid-19 tests. 
* The ability to securely share test results with others, acting as an "immunity passport".

### Registration ###
Registration and sign in occurs through one-time links sent to users inboxes.  No passwords are stored within the system, only someone with access to that email inbox can access the data.

![image](https://user-images.githubusercontent.com/1318111/78276488-02c86900-750b-11ea-8e93-d3135bc62de4.png)

### Test flows ###
There are multiple ways that tests can be administered. Tests can be run in person by medical practitioners, or can can be sent out to patients in the post.  Results may be immediately registered, or returned by post for analysis in the lab, whichever is required for that test equipment.  Tests may be for antigens or antibodies.  

The system understands the role of the person both administering the test, and registering the result, allowing for different confidence levels to establish:
* Did this person really take the test, or did the test sample come from someone else?
* Was the result observed and entered by a trusted professional?

#### In person tests
* The patient registers their details in the application
* The medical professional scans the patient's profile
* The medical professional administers the test and adds the results
* The results appear on the patient's device

#### Tests via post
* The test administrator generates a number of unique QR codes for their tests, which are printed out with test instructions.
* One printed QR code is sent out with each test.
* The patient receives the test in the post.
* The patient registers in the application (they can be already registered).
* The patient scans the printed QR code to register the test.
* The patient administers the test, following the instructions.
* Depending on whether this test provides immediate results, they either:
  * Submit their results through the application.
  * Post back their test sample with the original QR code.
    * On reciept of the test sample, a medical professional processes the sample.
    * The medical professional scans the printed QR code, and then enters the rest results.
    * The test results appear in the patients application.
    
![image](https://user-images.githubusercontent.com/1318111/78276614-2e4b5380-750b-11ea-98f8-3e258bdfb1f6.png)

### Test results ###
Users can see a list of their test results indicating whether antigens or antibodies were found, depending on the test type. If a medical professional added notes these are also available to view.  Along with links to additional information on understanding test results.

![image](https://user-images.githubusercontent.com/1318111/78277018-bcbfd500-750b-11ea-9e0c-54f08f9d2092.png)

### Immunity passport ###
Access to test results can be shared with others.  On the users profile page there is a short-lived QR code that grants temporary access to view & confirm another user's status.  The second user (the checker) takes a photo of this QR code, granting them access to view the test results of the first user (the patient).

At this point, if the 'checker' is a medical professional with sufficient priviledges, they can also add new verified test results for the patient (facillitating the in-person test flow).

![image](https://user-images.githubusercontent.com/1318111/78276524-107dee80-750b-11ea-88a2-cdb056428221.png)


## Team ##

This application was designed and built by a team of engineers from [transferwise.com/](https://transferwise.com/) in partnership with a team of medical professionals.

## Contributing

In the project directory, you can run:

### `npm run start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm run test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
