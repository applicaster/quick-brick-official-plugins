# Display Advertising for QB using a RN Library (Firebase Admob RN)

* Status: Proposed
* Deciders: @Guy @Ran @Francois 
* Date: 31/05/2020

Technical Story: Provide a solution for Display Advertising on QB. This includes Bottom Banners, Inline Banners and Interstitial ads.

## Context and Problem Statement

The decision in question is whether to implement the solution as a Native Module around the Google Admob library for Android / iOS, wrapped by a RN plugin, or integrate a 3rd party library that already does that.


## Considered Options

* *Native Module of Google Admob* - Implementing the Admob integration natively, following the guideline of the native SDKs ([https://developers.google.com/admob/android/quick-start](https://developers.google.com/admob/android/quick-start) - Android, [https://developers.google.com/admob/ios/quick-start](https://developers.google.com/admob/ios/quick-start) - iOS)

* *Integrate Firebase Admob RN* - Integrate the "React Native Firebase" 3rd party library that provides the Admob module - [https://rnfirebase.io/admob/usage](https://rnfirebase.io/admob/usage) Latest version requires React Native 62, but this was taken care of by the Frameworks team during Cycle X (May, 2020)



## Pros and Cons of the Options 

### Native Module of Google Admob

#### Pros
* The implementation of Admob is straightforward. The main effort will be around creating the RN bridge for displaying the ad. 
* We have more control over the code, as we write it from scratch.

#### Cons
* Implementation can potentially take longer than implementing an existing library.
* It requires maintenance by both an Android dev and iOS dev to support the native implementations.



### Integrate Firebase Admob RN

#### Pros
* Integration seems relatively easier and potentially can be quicker because all the heavy-lifting is taken care of by the library.
* The library appears to be stable and used by thousands of projects already, contributed to by hundreds of developers.

#### Cons
* Depending on a 3rd party for bug fixes and enhancements (or forking)
* Adding dependencies from Firebase rather than implementing the plain Admob library.



## Decision Outcome

Chosen option: **Integrate Firebase Admob RN** because it makes more sense to integrate an existing library that looks promising and stable, than writing the code from scratch. If the library proves to be stable, it will be easier to maintain in the long run.

### Positive Consequences

TBD

### Negative Consequences

TBD




