package com.example.jcvar.exercise1;

import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
import android.widget.Toast;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
    }

    public void buttonClick(View v){
        EditText  name = (EditText) findViewById(R.id.editText);
        String n = name.getText().toString();
        if(!n.equals("") )
            Toast.makeText(this, "Hi there, " + n, Toast.LENGTH_LONG).show();
        else
            Toast.makeText(this,"What is your name? ", Toast.LENGTH_LONG).show();
    }

}
