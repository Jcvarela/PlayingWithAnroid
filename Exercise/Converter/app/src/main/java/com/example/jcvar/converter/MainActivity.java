package com.example.jcvar.converter;

import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageButton;

public class MainActivity extends AppCompatActivity {

    private Selected input;
    private Selected output;

    private Currency[] currencies = {new Currency("USA", R.drawable.usa_currency,1),
                                    new Currency("Cuba",R.drawable.cuba_currency,25),
                                    new Currency("Euro",R.drawable.euro_currency,0.94)};

    private boolean modify = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        input = new Selected();
        input.editText = (EditText) findViewById(R.id.input);
        input.image = (ImageButton) findViewById(R.id.inputImage);
        input.pos = 0;
        input.c = currencies[input.pos];

        output = new Selected();
        output.editText = (EditText) findViewById(R.id.output);
        output.image = (ImageButton) findViewById(R.id.outputImage);
        output.pos = 1;
        output.c = currencies[output.pos];


        input.editText.addTextChangedListener(new TextWatcher(){
            @Override
            public void onTextChanged(CharSequence cs, int arg1, int arg2, int arg3) {

            }

            @Override
            public void beforeTextChanged(CharSequence s, int arg1, int arg2, int arg3) {

            }

            @Override
            public void afterTextChanged(Editable arg0) {
                ConvertFromTo(input,output);
            }
        });

        output.editText.addTextChangedListener(new TextWatcher(){
            @Override
            public void onTextChanged(CharSequence cs, int arg1, int arg2, int arg3) {

            }

            @Override
            public void beforeTextChanged(CharSequence s, int arg1, int arg2, int arg3) {

            }

            @Override
            public void afterTextChanged(Editable arg0) {
                ConvertFromTo(output,input);
            }
        });
    }

    public void inputClick(View v){
        changeSelected(input);
        ConvertFromTo(input,output);
    }
    public void outputClick(View v){
        changeSelected(output);
        ConvertFromTo(output,input);
    }


    private void changeSelected(Selected selected){
        selected.pos++;
        if(selected.pos >= currencies.length){
            selected.pos = 0;
        }

        selected.c = currencies[selected.pos];
        selected.image.setImageResource(selected.c.imageId);
    }



    public void ConvertFromTo(Selected input, Selected output){
        if(modify){
            modify = !modify;
            return;
        }
        modify = !modify;

        String value = input.editText.getText().toString();
        int n;

        if(value.equals("") || value.equals("NA")){
            n = 0;
        } else {
            n = (int)(Double.parseDouble(value) * 100);
        }

        n = (int)output.c.getCurrencyFrom(input.c,n);

        if(n > 1000000){
            output.editText.setText("NA");
        }else {
            output.editText.setText((n/100d) + "");
        }


    }
}

class Selected{
    EditText editText;
    Currency c;
    ImageButton image;
    int pos = 0;

    public Selected(){}
    public Selected(EditText editText, Currency c, ImageButton image){
        this.editText = editText;
        this.c = c;
        this.image = image;
    }
}



class Currency{
    String name;
    int imageId;
    double currencyDif;

    public Currency(String name, int imageId, double currencyDif){
        this.name = name;
        this.imageId = imageId;
        this.currencyDif = currencyDif;
    }


    public double getCurrencyFrom(Currency c, double value){
        double dif = c.currencyDif;
        value /= dif;
        value *= this.currencyDif;

        return value;
    }
}