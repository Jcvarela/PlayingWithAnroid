package com.jorge.playingwithandroid.facebooklogin9;

import android.content.Intent;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.widget.TextView;

import com.facebook.CallbackManager;
import com.facebook.FacebookCallback;
import com.facebook.FacebookException;
import com.facebook.FacebookSdk;
import com.facebook.GraphRequest;
import com.facebook.GraphResponse;
import com.facebook.Profile;
import com.facebook.ProfileTracker;
import com.facebook.login.LoginResult;
import com.facebook.login.widget.LoginButton;

import org.json.JSONObject;

import java.util.Arrays;

public class MainActivity extends AppCompatActivity {
    LoginButton loginButton;
    TextView logInStatus;
    CallbackManager callbackManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        FacebookSdk.sdkInitialize(getApplicationContext());
        setContentView(R.layout.activity_main);

        loginButton = (LoginButton) findViewById(R.id.login_button);
        logInStatus = (TextView) findViewById(R.id.logInStatus);
        callbackManager = CallbackManager.Factory.create();

        loginButton.setReadPermissions(Arrays.asList(
                "public_profile", "email", "user_birthday", "user_friends"));
        loginButton.registerCallback(callbackManager, new FacebookCallback<LoginResult>() {


            @Override
            public void onSuccess(LoginResult loginResult) {
                // App code



                GraphRequest request = GraphRequest.newMeRequest(
                        loginResult.getAccessToken(),
                        new GraphRequest.GraphJSONObjectCallback() {
                            @Override
                            public void onCompleted(JSONObject object, GraphResponse response) {
                                Log.v("LoginActivity", getInfo(response));
                                String email = "NULL";
                                String birthday = "NULL";

                                try {
                                    // Application code
                                    email = object.getString("email");
                                    birthday = object.getString("birthday"); // 01/31/1980 format
                                } catch (Exception e) {
                                    e.printStackTrace();
                                }
                            }
                        });
                Bundle parameters = new Bundle();
                parameters.putString("fields", "id,name,email,gender,birthday");
                request.setParameters(parameters);
                request.executeAsync();

                Log.v("LoginActivity", "access token".toUpperCase()  +  "!!!!! " +loginResult.getAccessToken().getToken() );
            }

            @Override
            public void onCancel() {
                logInStatus.setText("It's cancel");
            }

            @Override
            public void onError(FacebookException error) {
                logInStatus.setText("ERROR");
            }
        });
    }

    public String getInfo(GraphResponse p){
        String output = p.toString();
        output = output.replace(",","\n,");

        return output;
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data){
        super.onActivityResult(requestCode,resultCode,data);
        callbackManager.onActivityResult(requestCode,resultCode,data);
    }
}
