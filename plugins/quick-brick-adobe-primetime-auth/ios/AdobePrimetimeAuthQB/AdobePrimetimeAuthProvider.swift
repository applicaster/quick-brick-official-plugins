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

@objc(AdobePrimetimeAuthProvider)
public class AdobePrimetimeAuthProvider: RCTEventEmitter, EntitlementDelegate, EntitlementStatus {
    
    private var flow = AdobeFlow.none
    private var webLoginViewController: WebLoginViewController {
        let viewController = WebLoginViewController.instantiateVC()
        viewController.accessEnabler = accessEnabler
        viewController.modalPresentationStyle = .fullScreen
        viewController.cancelAction = { [weak self] in
            self?.finishFlow()
        }
        return viewController
    }
    private var loginViewController: WebLoginViewController?
    private var pluginConfig = [String: String]()
    private var additionalParameters = [String: Any]()
    private var accessEnabler = AccessEnabler()
    private var resourceID: String?
    private var authCompletion: RCTResponseSenderBlock?
    
    @objc public func setupAccessEnabler(_ pluginConfig: [String: String]) {
        self.pluginConfig = pluginConfig
        accessEnabler = AccessEnabler(pluginConfig["software_statement"] ?? "")
        accessEnabler.delegate = self
        accessEnabler.statusDelegate = self
        accessEnabler.setRequestor(pluginConfig["requestor_id"] ?? "")
        self.resourceID = pluginConfig["resource_id"]
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
        let cookieStorage = HTTPCookieStorage.shared
        cookieStorage.cookies?.forEach({ (cookie) in
            cookieStorage.deleteCookie(cookie)
        })
        accessEnabler.checkAuthentication()
    }
    
    @objc private func setProviderID(_ providerID: String) {
        self.accessEnabler.setSelectedProvider(providerID)
    }
    
    public func setAuthenticationStatus(_ status: Int32, errorCode code: String!) {
        switch status {
        case ACCESS_ENABLER_STATUS_SUCCESS:
            _ = FacadeConnector.connector?.storage?.localStorageSetValue(for: "idToken", value: "authToken", namespace: nil)
            if let stringForAuthorization = getResourceStringForAuthorization() {
                self.accessEnabler.getAuthorization(stringForAuthorization)
            } else {
                finishFlow()
            }
        case ACCESS_ENABLER_STATUS_ERROR:
            if code == USER_NOT_AUTHENTICATED_ERROR && flow == .logout {
                _ = FacadeConnector.connector?.storage?.localStorageSetValue(for: "idToken", value: "\"{}\"", namespace: nil)
                finishFlow()
            } else {
                accessEnabler.getAuthentication()
            }
        default:
            break
        }
    }
    
    public func setToken(_ token: String!, forResource resource: String!) {
        finishFlow(token)
    }
    
    public func tokenRequestFailed(_ resource: String!, errorCode code: String!, errorDescription description: String!) {
        if flow == .login {
            let message = "This content is not included in your package"
            let okText = "OK"
            let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: okText, style: .default, handler: { _ in
                self.finishFlow()
            }))
            let topViewController = UIViewController.topmostViewController()
            topViewController?.present(alert, animated: true, completion: nil)
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
                finishFlow()
                return
            }
            loginViewController = webLoginViewController
            let topViewController = UIViewController.topmostViewController()
            topViewController?.present(loginViewController!, animated: true, completion: {
                self.loginViewController?.webView.load(URLRequest(url: url))
            })
        }
    }
    
    private func dismissWebView() {
        loginViewController?.dismiss(animated: true, completion: {
            self.loginViewController = nil
        })
    }
    
    private func finishFlow(_ token: String? = nil) {
        dismissWebView()
        switch flow {
        case .login:
            token == nil ? authCompletion?([]) : authCompletion?([["token": token]])
        default:
            authCompletion?([])
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
