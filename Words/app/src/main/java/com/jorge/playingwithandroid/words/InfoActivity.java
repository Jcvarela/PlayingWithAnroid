package com.jorge.playingwithandroid.words;

import android.content.Intent;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.TextView;

import com.jorge.playingwithandroid.words.data.AllData;
import com.jorge.playingwithandroid.words.data.Info;

public class InfoActivity extends AppCompatActivity {

    final static String tag = "InfoActivity";

    private View mainImageView;
    private TextView titleTextView;
    private TextView infoTextView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_info);

        mainImageView = findViewById(R.id.mainImage);
        titleTextView = (TextView) findViewById(R.id.TitleTextView);
        infoTextView = (TextView) findViewById(R.id.infoTextView) ;

        init();
    }

    private void init(){
        Intent intent = getIntent();
        String value = intent.getStringExtra("index");

        Info obj = AllData.getAllData().getInfoArray().get(Integer.parseInt(value));

        setMainImage(R.drawable.oneup);
        setTitleTextView(obj.getName());

        setInfoTextView(obj.getInfo());
    }

    public void click(View view){
        TextView text = (TextView) findViewById(R.id.infoTextView);
        text.append(text.getText() + " more infoArray ");
    }

    public void backClick(View view){
        super.onBackPressed();
    }


    public void setMainImage(int drawable){
        mainImageView.setBackgroundResource(drawable);
    }

    public void setTitleTextView(String data){
        this.titleTextView.setText(data);
    }

    public void setInfoTextView(String data){
        this.infoTextView.setText(data);
    }

}
