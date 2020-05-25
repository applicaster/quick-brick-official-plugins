//
//  AdobePrimetimeAuthProvider.swift
//  AdobeAccessEnablerQB
//
//  Created by brel on 3/24/20.
//
import React
import Foundation
import AccessEnabler
import ZappCore

enum AdobeFlow {
    case login
    case logout
    case none
}

enum AdobeError: Error {
    case tokenRetrieveError(String)
    case undefined
}

@objc(AdobePrimetimeAuthProvider)
public class AdobePrimetimeAuthProvider: RCTEventEmitter, EntitlementDelegate, EntitlementStatus {
    
    private var flow = AdobeFlow.none
    private var webLoginViewController: WebLoginViewController?
    private var pluginConfig = [String: Any]()
    private var additionalParameters = [String: Any]()
    private var accessEnabler = AccessEnabler()
    private var resourceID: String?
    private var authCompletion: RCTResponseSenderBlock?
    
    @objc public func setupAccessEnabler(_ pluginConfig: [String: Any]) {
        self.pluginConfig = pluginConfig
        guard let resourceID = pluginConfig["resource_id"] as? String,
              let softwareStatement = pluginConfig["software_statement"] as? String,
              let requestorID = pluginConfig["requestor_id"] as? String,
              let baseUrl = pluginConfig["base_url_ios"] as? String
            else {
            return
        }
        accessEnabler = AccessEnabler(softwareStatement)
        accessEnabler.delegate = self
        accessEnabler.statusDelegate = self
        accessEnabler.setRequestor(requestorID, serviceProviders: [baseUrl])
        self.resourceID = resourceID
    }
    
    @objc public func startLoginFlow(_ additionalParameters: [String: Any], callback: @escaping RCTResponseSenderBlock) {
        flow = .login
        self.authCompletion = callback
        self.additionalParameters = additionalParameters
        self.accessEnabler.checkAuthentication()
    }
    
    @objc public func logout(_ callback: @escaping RCTResponseSenderBlock) {
        flow = .logout
        self.authCompletion = callback
        self.accessEnabler.logout()
        HTTPCookieStorage.shared.removeCookies(since: Date.distantPast)
        WKWebsiteDataStore.default().fetchDataRecords(ofTypes: WKWebsiteDataStore.allWebsiteDataTypes()) { records in
            records.forEach { record in
                WKWebsiteDataStore.default().removeData(ofTypes: record.dataTypes, for: [record], completionHandler: {})
            }
        }
        accessEnabler.checkAuthentication()
    }
    
    @objc public func setProviderID(_ providerID: String) {
        self.accessEnabler.setSelectedProvider(providerID)
    }
    
    public func setAuthenticationStatus(_ status: Int32, errorCode code: String!) {
        switch status {
        case ACCESS_ENABLER_STATUS_SUCCESS:
            _ = FacadeConnector.connector?.storage?.localStorageSetValue(for: "idToken", value: "authToken", namespace: nil)
            if let stringForAuthorization = getResourceStringForAuthorization() {
                self.accessEnabler.getAuthorization(stringForAuthorization)
            } else {
                finishFlow(.failure(.undefined))
            }
        case ACCESS_ENABLER_STATUS_ERROR:
            if code == USER_NOT_AUTHENTICATED_ERROR && flow == .logout {
                _ = FacadeConnector.connector?.storage?.localStorageSetValue(for: "idToken", value: "\"{}\"", namespace: nil)
                finishFlow(.success(""))
            } else {
                accessEnabler.getAuthentication()
            }
        default:
            break
        }
    }
    
    public func setToken(_ token: String!, forResource resource: String!) {
        _ = FacadeConnector.connector?.storage?.localStorageSetValue(for: "idToken", value: token, namespace: nil)
        finishFlow(.success(token))
    }
    
    public func tokenRequestFailed(_ resource: String!, errorCode code: String!, errorDescription description: String!) {
        if flow == .login {
            var errorMessage: String = description
            if let defaultError = pluginConfig["authorization_default_error_message"] as? String, errorMessage.isEmpty {
                errorMessage = defaultError
            }
            self.finishFlow(.failure(.tokenRetrieveError(errorMessage)))
        }
    }
    
    public func displayProviderDialog(_ mvpds: [Any]!) {
        guard let providers = mvpds as? [MVPD] else {
            return
        }
        sendEvent(withName: "showProvidersList", body: providers.toJSONObjects())
    }
    
    public func navigate(toUrl url: String!) {
        if flow == .login  {
            guard let url = URL(string: url) else {
                finishFlow(.failure(.undefined))
                return
            }
            let viewController = WebLoginViewController.instantiateVC()
            webLoginViewController = viewController
            viewController.accessEnabler = accessEnabler
            viewController.modalPresentationStyle = .fullScreen
            viewController.cancelAction = { [weak self] in
                self?.finishFlow(.failure(.undefined))
            }
            let topViewController = UIViewController.topmostViewController()
            topViewController?.present(viewController, animated: true, completion: {
                viewController.webView.load(URLRequest(url: url))
            })
        }
    }
    
    private func dismissWebView() {
        webLoginViewController?.dismiss(animated: true, completion: {
            self.webLoginViewController = nil
        })
    }
    
    private func finishFlow(_ result: Result<String,AdobeError>) {
        dismissWebView()
        switch result {
        case .success(let token):
            authCompletion?([["token": token]])
        case .failure(let error):
            switch error {
            case .tokenRetrieveError(let errorMessage):
                authCompletion?([["errorMessage": errorMessage]])
            default:
                authCompletion?([])
            }
        }
        authCompletion = nil
        flow = .none
    }
    
    //MARK:- Unused Delegate methods
    
    public func setRequestorComplete(_ status: Int32) {}
    
    public func selectedProvider(_ mvpd: MVPD!) {}
    
    public func sendTrackingData(_ data: [Any]!, forEventType event: Int32) {}
    
    public func setMetadataStatus(_ metadata: Any!, encrypted: Bool, forKey key: Int32, andArguments arguments: [AnyHashable : Any]!) {}
    
    public func presentTvProviderDialog(_ viewController: UIViewController!) {}
    
    public func dismissTvProviderDialog(_ viewController: UIViewController!) {}
    
    public func status(_ statusDictionary: [AnyHashable : Any]!) {}
    
    public func preauthorizedResources(_ resources: [Any]!) {}
    
    //MARK:- helper method to get resourceId string
    
    private func getResourceStringForAuthorization() -> String? {
        guard let resourceID = self.resourceID,
              let itemID = additionalParameters["itemID"] as? String,
              let itemTitle = additionalParameters["itemTitle"] as? String
            else {
            return nil
        }
        return "<rss version=\"2.0\" xmlns:media=\"http://search.yahoo.com/mrss/\"><channel><title>\(resourceID)</title><item><title>\(itemTitle)</title><guid>\(itemID)</guid></item></channel></rss>"
    }
    
    //MARK:- React native support
    
    override open var methodQueue: DispatchQueue {
        return DispatchQueue.main
    }
    
    override public class func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    override public func supportedEvents() -> [String]! {
      return ["showProvidersList"]
    }
}
