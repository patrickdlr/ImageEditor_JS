let num2 = 0;
function filter2() {

    let canvas = document.getElementById('cv2'); 
    let ctx = canvas.getContext('2d');

    let counter = 0;
    let counter1 = 0;
    let counter2 = 0;

    //0 - 1.0 store to undolist
    image_redolist = [];
    image_undolist.push(imageData);
    logprint();
    
    // 3.0
    if (canvas.width <= 1200 && canvas.height <= 1800) {
        oilPaintEffect(1,8);
    }
    else if (canvas.width <= 1800 && canvas.height <= 1200) {
        oilPaintEffect(1,8); 
    }
    else {
        oilPaintEffect(2,15)
    }

    // 3.0
    imageData = ctx.getImageData(0, 0, image.width, image.height); 
    let data = imageData.data;
    imageData_original2_data_1d = ctx.getImageData(0, 0, image.width, image.height).data;
    

    let height = image.height -1;
    let width = image.width -1;
    
    let array_gx = [];
    array_gx.push([-1,0,1]);
    array_gx.push([-2,0,2]);
    array_gx.push([-1,0,1]);
    let array_gy = [];
    array_gy.push([-1,-2,-1]);
    array_gy.push([0,0,0]);
    array_gy.push([1,2,1]);

    let val_Alpha = 0;
    let val_Blue = 0;
    let val_Green = 0;
    let val_Red = 0;
    
    let Gx_sum_Red = 0;
    let Gx_sum_Green = 0;
    let Gx_sum_Blue = 0;
    let Gy_sum_Red = 0;
    let Gy_sum_Green = 0;
    let Gy_sum_Blue = 0;
    let Gxy_sum_final_Red = 0;
    let Gxy_sum_final_Green = 0;
    let Gxy_sum_final_Blue = 0;


    //////
    //////
    //UX:
    let customBGcolor_R = 100; //0-255
    let customBGcolor_G = 100; //0-255
    let customBGcolor_B = 235; //0-255
    let customBGcolor_A = 255; // only 255 or 0 / on or off

    let hard_spot_reducer = 255; //intensity of white/black lines // 84-255
    let customlineshadowcolor_R_m = 0; //0-limit
    let customlineshadowcolor_G_m = 0; //0-limit
    let customlineshadowcolor_B_m = 0; //0-limit

    let use_blackline = false;
    let cutoff = 20; //10-20% of 255 recommended 20-50
    //////
    //////


    //auto mode for use_blackline (for better user experinece):
    let trio7 = (customBGcolor_R + customBGcolor_G + customBGcolor_B)/3;
    if (trio7 >= 106) {use_blackline = true;} //.41 of 255 (106)
    
    //if use_blackline === true, "pre-invert" custom BG and line colors:
    if (use_blackline === true) {  
        customBGcolor_R = 255 - customBGcolor_R;
        customBGcolor_G = 255 - customBGcolor_G;
        customBGcolor_B = 255 - customBGcolor_B;
        customlineshadowcolor_R_m *= -1;
        customlineshadowcolor_G_m *= -1;
        customlineshadowcolor_B_m *= -1;
    }

    // adjsut customlineshadowcolor - limit excessive bright colors, rebalance other line colors:
    //limit excessive bright colors
    let max1 = 84;
    if (customlineshadowcolor_R_m > max1) {customlineshadowcolor_R_m = max1; }
    if (customlineshadowcolor_G_m > max1) {customlineshadowcolor_G_m = max1; }
    if (customlineshadowcolor_B_m > max1) {customlineshadowcolor_B_m = max1; }
    //hold constant vars
    const helper_R = customlineshadowcolor_R_m; 
    const helper_G = customlineshadowcolor_G_m;
    const helper_B = customlineshadowcolor_B_m;
    //rebalance other line colors
    customlineshadowcolor_R_m -= helper_G/2; 
    customlineshadowcolor_R_m -= helper_B/2;
    customlineshadowcolor_G_m -= helper_R/2;
    customlineshadowcolor_G_m -= helper_B/2;
    customlineshadowcolor_B_m -= helper_R/2;
    customlineshadowcolor_B_m -= helper_G/2;


            
    for (let y = 0; y < image.height; y ++) {
        for (let x = 0; x < image.width; x ++) {

            //formula for 1d array
            let formula = (y*image.width*4)+x*4;
            
            //turn bright part of original image into custom background color and skip edge detection
            let highestlimit1 = 205;
            let bw_avg_1 = (imageData_original2_data_1d[formula+0]+imageData_original2_data_1d[formula+1]+imageData_original2_data_1d[formula+2])/3;

            if (bw_avg_1 >= highestlimit1) {
                if (use_blackline === false) {
                    data[formula+0] = customBGcolor_R * (bw_avg_1/highestlimit1);
                    data[formula+1] = customBGcolor_G * (bw_avg_1/highestlimit1);
                    data[formula+2] = customBGcolor_B * (bw_avg_1/highestlimit1);
                    data[formula+3] = customBGcolor_A;
                }
                else if(use_blackline === true) { 
                    data[formula+0] = ((255-customBGcolor_R) * (bw_avg_1/highestlimit1));
                    data[formula+1] = ((255-customBGcolor_G) * (bw_avg_1/highestlimit1));
                    data[formula+2] = ((255-customBGcolor_B) * (bw_avg_1/highestlimit1));
                    data[formula+3] = customBGcolor_A;
                }
                continue;
            }
            
            
            //turn other part of original image into edges
            Gx_sum_Red = 0; Gx_sum_Green = 0; Gx_sum_Blue = 0;
            Gy_sum_Red = 0; Gy_sum_Green = 0; Gy_sum_Blue = 0;
            Gxy_sum_final_Red = 0; 
            Gxy_sum_final_Green = 0;
            Gxy_sum_final_Blue = 0;

            //3x3
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    if (((y + (r - 1) >= 0) && (x + (c - 1) >= 0)) && ((y + (r - 1) <= height) && (x + (c - 1) <= width)))
                    {
                        // attempt 6 (success - edge detection)
                        // imageData_original2_data_1d[formula + row (-1 to 1) + col (-1 to 1) + 0/1/2]
                        val_Red = imageData_original2_data_1d[formula + ((r-1)*image.width*4) + ((c-1)*4) + 0];
                        val_Green = imageData_original2_data_1d[formula + ((r-1)*image.width*4) + ((c-1)*4) + 1];
                        val_Blue = imageData_original2_data_1d[formula + ((r-1)*image.width*4) + ((c-1)*4) + 2];
                    }

                    // if outside the border (row)
                    if ((y + (r - 1) < 0) || (y + (r - 1) > (height)))
                    {
                        val_Red = 0;
                        val_Green = 0;
                        val_Blue = 0;
                    }

                    // if outside the border (column)
                    else if ((x + (c - 1) < 0) || (x + (c - 1) > (width)))
                    {
                        val_Red = 0;
                        val_Green = 0;
                        val_Blue = 0;
                    }

                    Gx_sum_Blue += val_Blue * array_gx[r][c];
                    Gx_sum_Green += val_Green * array_gx[r][c];
                    Gx_sum_Red += val_Red * array_gx[r][c];
                    Gy_sum_Blue += val_Blue * array_gy[r][c];
                    Gy_sum_Green += val_Green * array_gy[r][c];
                    Gy_sum_Red += val_Red * array_gy[r][c];
                }
            
            val_Alpha = imageData_original2_data_1d[formula+3];
        
            // example: Gxy_sum_final_Red = (Gx_sum_Red^2 + Gy_sum_Red^2)^1/2
            Gxy_sum_final_Red = Math.pow(
                (Math.pow(Gx_sum_Red, 2) + Math.pow(Gy_sum_Red, 2)), 0.5
                );
            Gxy_sum_final_Green = Math.pow(
                (Math.pow(Gx_sum_Green, 2) + Math.pow(Gy_sum_Green, 2)), 0.5
                );
            Gxy_sum_final_Blue = Math.pow(
                (Math.pow(Gx_sum_Blue, 2) + Math.pow(Gy_sum_Blue, 2)), 0.5
                );

            let max = 255; let min = 0;
            if (Gxy_sum_final_Blue > max) { Gxy_sum_final_Blue = 255; }
            if (Gxy_sum_final_Green > max) { Gxy_sum_final_Green = 255; }
            if (Gxy_sum_final_Red > max) { Gxy_sum_final_Red = 255; }
            if (Gxy_sum_final_Blue < min) { Gxy_sum_final_Blue = 0; }
            if (Gxy_sum_final_Green < min) { Gxy_sum_final_Green = 0; }
            if (Gxy_sum_final_Red < min) { Gxy_sum_final_Red = 0; }








            // //LINE 1.2 = in progress
            // //colored lines, black abckground
            // //white background? transparent background?
            // //user options:
            // let bw_avg_2;
            // bw_avg_2 = (Gxy_sum_final_Red+Gxy_sum_final_Green + Gxy_sum_final_Blue)/3;
            
            // Gxy_sum_final_Red = bw_avg_2;
            // Gxy_sum_final_Green = bw_avg_2;
            // Gxy_sum_final_Blue = bw_avg_2;


            // customBGcolor_R = 127;
            // customBGcolor_G = 127;
            //  customBGcolor_B = 127;
            //  customBGcolor_A = 255; 
            // let use_whiteBG = false;

            // //black line
            // if (use_blackline === true) {
            //     //cutoff = 255-cutoff; //?? enable this A1
            //     // customBGcolor_R = 255-customBGcolor_R;
            //     // customBGcolor_G = 255-customBGcolor_G;
            //     // customBGcolor_B = 255-customBGcolor_B;
            // }

            // //white line
            // if (use_blackline === false) {
                
            //     //cutoff = 255-cutoff;
            // }


            // ////HOW TO PUT USE_WHITELINE here?
            // // //dark back ground, white line
            // if (Gxy_sum_final_Blue <= cutoff && Gxy_sum_final_Blue <= cutoff && Gxy_sum_final_Blue <= cutoff) //?? enable this A2
            // // //light back ground, black line
            // //if (Gxy_sum_final_Blue >= cutoff && Gxy_sum_final_Blue >= cutoff && Gxy_sum_final_Blue >= cutoff)
            // {
            //     //set custom background color or/and opacity //disable this A3
            //     Gxy_sum_final_Red = 0;
            //     Gxy_sum_final_Green = 0;
            //     Gxy_sum_final_Blue = 0; 
            //     val_Alpha = 255; //slider 0-255 
            // }
            // else
            // {    

            //     if (Gxy_sum_final_Red < 24) {Gxy_sum_final_Red = 24; }
            //     if (Gxy_sum_final_Green < 0) {Gxy_sum_final_Green = 0; }
            //     if (Gxy_sum_final_Blue < 0) {Gxy_sum_final_Blue = 0; }

            //     let linecolor_tomatch_bgcolor_Red;
            //     let linecolor_tomatch_bgcolor_Green;
            //     let linecolor_tomatch_bgcolor_Blue;
            //     // // // colored matching line (dark back ground, white line)
            //     // if (use_blackline === false) {     
            //     //     linecolor_tomatch_bgcolor_Red = 255/(255-customBGcolor_R);
            //     //     linecolor_tomatch_bgcolor_Green = 255/(255-customBGcolor_G);
            //     //     linecolor_tomatch_bgcolor_Blue = 255/(255-customBGcolor_B);
            //     // }
            //     // // // colored matching line (light back ground, dark line)
            //     // if (use_blackline === true) {
            //         linecolor_tomatch_bgcolor_Red = customBGcolor_R/255;
            //         linecolor_tomatch_bgcolor_Green = customBGcolor_G/255;
            //         linecolor_tomatch_bgcolor_Blue = customBGcolor_B/255;   
            //    // }


            //     // //eliminate rgb value of 0 that can't be darkened/lightened by multiplication
            //     let too_dark = 1;
            //     if (Gxy_sum_final_Red <= too_dark) 
            //     {Gxy_sum_final_Red = too_dark; }
            //     if (Gxy_sum_final_Green <= too_dark) 
            //     {Gxy_sum_final_Green = too_dark; }
            //     if (Gxy_sum_final_Blue <= too_dark) 
            //     {Gxy_sum_final_Blue = too_dark; }





            //     // //COLORED line whitener
            //     //if (use_blackline === false) {
            //         //let soft_spot_increaser = 85; //slider (0-128)
            //         // let soft_spot_increaser = (Gxy_sum_final_Red + Gxy_sum_final_Green + Gxy_sum_final_Blue)/3 * (2); //auto mode (very nice to have) (1-2) or 2 only slider
            //         // if (Gxy_sum_final_Red <= soft_spot_increaser) 
            //         // {Gxy_sum_final_Red = soft_spot_increaser};
            //         // if (Gxy_sum_final_Green <= soft_spot_increaser) 
            //         // {Gxy_sum_final_Green = soft_spot_increaser};
            //         // if (Gxy_sum_final_Blue <= soft_spot_increaser) 
            //         // {Gxy_sum_final_Blue = soft_spot_increaser};
            //     //}
            //     // // //soft spot increaser (light back ground, dark line) - (0-1)
            //     // if (use_blackline === true) {
            //     //     //let soft_spot_increaser = 128; //slider (128-255)
            //     //     let soft_spot_increaser = (Gxy_sum_final_Red + Gxy_sum_final_Green + Gxy_sum_final_Blue)/3 * (0.75); //auto mode (testing) (0-1) or .75 only slider
            //     //     if (Gxy_sum_final_Red >= soft_spot_increaser) 
            //     //     {Gxy_sum_final_Red = soft_spot_increaser};
            //     //     if (Gxy_sum_final_Green >= soft_spot_increaser) 
            //     //     {Gxy_sum_final_Green = soft_spot_increaser};
            //     //     if (Gxy_sum_final_Blue >= soft_spot_increaser) 
            //     //     {Gxy_sum_final_Blue = soft_spot_increaser};
            //     // }





            //     // line and background color matching
            //     Gxy_sum_final_Red *= linecolor_tomatch_bgcolor_Red; 
            //     Gxy_sum_final_Green *= linecolor_tomatch_bgcolor_Green; 
            //     Gxy_sum_final_Blue *= linecolor_tomatch_bgcolor_Blue;



            //     //correction
            //     if (Gxy_sum_final_Blue > max) { Gxy_sum_final_Blue = 255; }
            //     if (Gxy_sum_final_Green > max) { Gxy_sum_final_Green = 255; }
            //     if (Gxy_sum_final_Red > max) { Gxy_sum_final_Red = 255; }
            //     if (Gxy_sum_final_Blue < min) { Gxy_sum_final_Blue = 0; }
            //     if (Gxy_sum_final_Green < min) { Gxy_sum_final_Green = 0; }
            //     if (Gxy_sum_final_Red < min) { Gxy_sum_final_Red = 0; }
              

                

            // }
            // Gxy_sum_final_Red = 255-Gxy_sum_final_Red;
            // Gxy_sum_final_Green = 255-Gxy_sum_final_Green;
            // Gxy_sum_final_Blue = 255-Gxy_sum_final_Blue;






            // //LINE 1.3 = in progress
            // //user options:

            // //dark back ground, white line
            // if (use_blackline === true) {
            //     //cutoff = 255-cutoff; //?? enable this A1
            //     customBGcolor_R = 255-customBGcolor_R;
            //     customBGcolor_G = 255-customBGcolor_G;
            //     customBGcolor_B = 255-customBGcolor_B;
            // }

            // //light back ground, black line
            // if (use_blackline === false) {
                
            //     //cutoff = 255-cutoff;
            // }


            // ////HOW TO PUT USE_WHITELINE here?
            // // //dark back ground, white line
            // if (Gxy_sum_final_Blue <= cutoff && Gxy_sum_final_Blue <= cutoff && Gxy_sum_final_Blue <= cutoff) //?? enable this A2
            // // //light back ground, black line
            // //if (Gxy_sum_final_Blue >= cutoff && Gxy_sum_final_Blue >= cutoff && Gxy_sum_final_Blue >= cutoff)
            // {
            //     //set custom background color or/and opacity //disable this A3
            //     // Gxy_sum_final_Red = customBGcolor_R;
            //     // Gxy_sum_final_Green =customBGcolor_G; 
            //     // Gxy_sum_final_Blue = customBGcolor_B; 
            //     // val_Alpha = 255; //slider 0-255 
            // }
            // else
            // {    
            //     let linecolor_tomatch_bgcolor_Red;
            //     let linecolor_tomatch_bgcolor_Green;
            //     let linecolor_tomatch_bgcolor_Blue;
            //     // // // colored matching line (dark back ground, white line)
            //     // if (use_blackline === false) {     
            //     //     linecolor_tomatch_bgcolor_Red = 255/(255-customBGcolor_R);
            //     //     linecolor_tomatch_bgcolor_Green = 255/(255-customBGcolor_G);
            //     //     linecolor_tomatch_bgcolor_Blue = 255/(255-customBGcolor_B);
            //     // }
            //     // // // colored matching line (light back ground, dark line)
            //     // if (use_blackline === true) {
            //         linecolor_tomatch_bgcolor_Red = customBGcolor_R/255;
            //         linecolor_tomatch_bgcolor_Green = customBGcolor_G/255;
            //         linecolor_tomatch_bgcolor_Blue = customBGcolor_B/255;   
            //    // }


            //     // //eliminate rgb value of 0 that can't be darkened/lightened by multiplication
            //     let too_dark = 1;
            //     if (Gxy_sum_final_Red <= too_dark) 
            //     {Gxy_sum_final_Red = too_dark; }
            //     if (Gxy_sum_final_Green <= too_dark) 
            //     {Gxy_sum_final_Green = too_dark; }
            //     if (Gxy_sum_final_Blue <= too_dark) 
            //     {Gxy_sum_final_Blue = too_dark; }



            //     // // //boldener (dark back ground, white line) - (1-2) ex: 1.2
            //     // // //boldener (light back ground, dark line) - (0-1) ex: 0.8
            //     // let nontransparentlines__boldness__slider = 1;
            //     // if (use_blackline === false) {
            //     //     nontransparentlines__boldness__slider = 1.2; }
            //     // if (use_blackline === TextTrackCueList) {
            //     //     nontransparentlines__boldness__slider = 0.8; }

            //     // Gxy_sum_final_Red *= nontransparentlines__boldness__slider;
            //     // Gxy_sum_final_Green *= nontransparentlines__boldness__slider;
            //     // Gxy_sum_final_Blue *= nontransparentlines__boldness__slider;

            //     // // with correction
            //     // if (Gxy_sum_final_Blue > max) { Gxy_sum_final_Blue = 255; }
            //     // if (Gxy_sum_final_Green > max) { Gxy_sum_final_Green = 255; }
            //     // if (Gxy_sum_final_Red > max) { Gxy_sum_final_Red = 255; }
            //     // if (Gxy_sum_final_Blue < min) { Gxy_sum_final_Blue = 0; }
            //     // if (Gxy_sum_final_Green < min) { Gxy_sum_final_Green = 0; }
            //     // if (Gxy_sum_final_Red < min) { Gxy_sum_final_Red = 0; }



            //     // // //soft spot increaser (dark back ground, white line) - (0-1)
            //     // if (use_blackline === false) {
            //     //     //let soft_spot_increaser = 85; //slider (0-128)
            //     //     let soft_spot_increaser = (Gxy_sum_final_Red + Gxy_sum_final_Green + Gxy_sum_final_Blue)/3 * (2); //auto mode (very nice to have) (1-2) or 2 only slider
            //     //     if (Gxy_sum_final_Red <= soft_spot_increaser) 
            //     //     {Gxy_sum_final_Red = soft_spot_increaser};
            //     //     if (Gxy_sum_final_Green <= soft_spot_increaser) 
            //     //     {Gxy_sum_final_Green = soft_spot_increaser};
            //     //     if (Gxy_sum_final_Blue <= soft_spot_increaser) 
            //     //     {Gxy_sum_final_Blue = soft_spot_increaser};
            //     // }
            //     // // //soft spot increaser (light back ground, dark line) - (0-1)
            //     // if (use_blackline === true) {
            //     //     //let soft_spot_increaser = 128; //slider (128-255)
            //     //     let soft_spot_increaser = (Gxy_sum_final_Red + Gxy_sum_final_Green + Gxy_sum_final_Blue)/3 * (0.75); //auto mode (testing) (0-1) or .75 only slider
            //     //     if (Gxy_sum_final_Red >= soft_spot_increaser) 
            //     //     {Gxy_sum_final_Red = soft_spot_increaser};
            //     //     if (Gxy_sum_final_Green >= soft_spot_increaser) 
            //     //     {Gxy_sum_final_Green = soft_spot_increaser};
            //     //     if (Gxy_sum_final_Blue >= soft_spot_increaser) 
            //     //     {Gxy_sum_final_Blue = soft_spot_increaser};
            //     // }


                
            //     // //bold spot reducer (dark background, white line)
            //     // if (use_blackline === false) {
            //     //     //let bold_spot_reducer = 255; //slider (128-255)
            //     //     let bold_spot_reducer = (Gxy_sum_final_Red + Gxy_sum_final_Green + Gxy_sum_final_Blue)/3 * (2); //auto mode
            //     //     if (Gxy_sum_final_Red >= bold_spot_reducer) 
            //     //     {Gxy_sum_final_Red = bold_spot_reducer};
            //     //     if (Gxy_sum_final_Green >= bold_spot_reducer) 
            //     //     {Gxy_sum_final_Green = bold_spot_reducer};
            //     //     if (Gxy_sum_final_Blue >= bold_spot_reducer) 
            //     //     {Gxy_sum_final_Blue = bold_spot_reducer};
            //     // }
            //     // if (use_blackline === TextTrackCue) {
            //     //     //bold spot reducer (light background, dark line)
            //     //     //let bold_spot_reducer = 64; //slider (0-128)
            //     //     let bold_spot_reducer = (Gxy_sum_final_Red + Gxy_sum_final_Green + Gxy_sum_final_Blue)/3 * (.75); //auto mode
            //     //     if (Gxy_sum_final_Red <= bold_spot_reducer) 
            //     //     {Gxy_sum_final_Red = bold_spot_reducer};
            //     //     if (Gxy_sum_final_Green <= bold_spot_reducer)
            //     //     {Gxy_sum_final_Green  = bold_spot_reducer};
            //     //     if (Gxy_sum_final_Blue <= bold_spot_reducer)
            //     //     {Gxy_sum_final_Blue  = bold_spot_reducer};
            //     // }



            //     // line and background color matching
            //     Gxy_sum_final_Red *= linecolor_tomatch_bgcolor_Red; 
            //     Gxy_sum_final_Green *= linecolor_tomatch_bgcolor_Green; 
            //     Gxy_sum_final_Blue *= linecolor_tomatch_bgcolor_Blue;



            //     //correction
            //     if (Gxy_sum_final_Blue > max) { Gxy_sum_final_Blue = 255; }
            //     if (Gxy_sum_final_Green > max) { Gxy_sum_final_Green = 255; }
            //     if (Gxy_sum_final_Red > max) { Gxy_sum_final_Red = 255; }
            //     if (Gxy_sum_final_Blue < min) { Gxy_sum_final_Blue = 0; }
            //     if (Gxy_sum_final_Green < min) { Gxy_sum_final_Green = 0; }
            //     if (Gxy_sum_final_Red < min) { Gxy_sum_final_Red = 0; }


                

            // }
            // // Gxy_sum_final_Red = 255-Gxy_sum_final_Red;
            // // Gxy_sum_final_Green = 255-Gxy_sum_final_Green;
            // // Gxy_sum_final_Blue = 255-Gxy_sum_final_Blue;




            
            
            //bw_avg_2 = after normal edge detection, before line/background customization
            let bw_avg_2 = (Gxy_sum_final_Red+Gxy_sum_final_Green + Gxy_sum_final_Blue)/3;

            // bw
            Gxy_sum_final_Red = bw_avg_2;
            Gxy_sum_final_Green = bw_avg_2;
            Gxy_sum_final_Blue = bw_avg_2;


            // //line 1.4 (optional): add custom/transparent background, modify underlying white lines' boldness, soft/hard spots, and shadow colors
            // //notes: white/black lines = works with dark/light/transparent background
            

            //put while loop here?
            


            // //user options (moved up)
            // //only works of here, instead of up there
            let customlineshadowcolor_R = customlineshadowcolor_R_m;
            let customlineshadowcolor_G = customlineshadowcolor_G_m;
            let customlineshadowcolor_B = customlineshadowcolor_B_m;
            
            if (bw_avg_2 <= cutoff)
            {
                // set desired background color/opacity
                Gxy_sum_final_Red = customBGcolor_R*(customBGcolor_A/255);
                Gxy_sum_final_Green = customBGcolor_G*(customBGcolor_A/255);
                Gxy_sum_final_Blue = customBGcolor_B*(customBGcolor_A/255);
                val_Alpha = customBGcolor_A;
            }

            else if (bw_avg_2 > cutoff)
            {    

                ////////modifications for underlying white lines - modify overall boldness, soft spots, and hard spots of underying white lines
                
                ////step 1: replace underlying white lines' RGB colors of 0 with new number that can be easily manipulating by multiplication/division necessary for modifying overall boldness, soft spots, and hard spots
                let too_dark = 1;
                if (Gxy_sum_final_Red <= too_dark) 
                {Gxy_sum_final_Red = too_dark; }
                if (Gxy_sum_final_Green <= too_dark) 
                {Gxy_sum_final_Green = too_dark; }
                if (Gxy_sum_final_Blue <= too_dark) 
                {Gxy_sum_final_Blue = too_dark; }
                
                // ////step 2: modify boldness of white lines (to bring up low RGB color spots)
                // let nontransparentlines__boldness__slider = 1.2; //(1-2) //rec: 1 or 1.2
                // Gxy_sum_final_Red *= nontransparentlines__boldness__slider;
                // Gxy_sum_final_Green *= nontransparentlines__boldness__slider;
                // Gxy_sum_final_Blue *= nontransparentlines__boldness__slider;
                
                // ////step 2.1: "0-255" correction
                // if (Gxy_sum_final_Blue > max) { Gxy_sum_final_Blue = 255; }
                // if (Gxy_sum_final_Green > max) { Gxy_sum_final_Green = 255; }
                // if (Gxy_sum_final_Red > max) { Gxy_sum_final_Red = 255; }
                // if (Gxy_sum_final_Blue < min) { Gxy_sum_final_Blue = 0; }
                // if (Gxy_sum_final_Green < min) { Gxy_sum_final_Green = 0; }
                // if (Gxy_sum_final_Red < min) { Gxy_sum_final_Red = 0; }

                // ////step 3: increase soft spots
                let soft_spot_increaser = .28*255; //slider (0-128) //.275
                // if (soft_spot_increaser < (customBGcolor_R + customBGcolor_G + customBGcolor_B)/3 * .4) {
                //    soft_spot_increaser = (customBGcolor_R + customBGcolor_G + customBGcolor_B)/3 * .4;
                //    console.log("used1")
                // }
                if (Gxy_sum_final_Red < soft_spot_increaser) 
                {Gxy_sum_final_Red = soft_spot_increaser};
                if (Gxy_sum_final_Green < soft_spot_increaser) 
                {Gxy_sum_final_Green = soft_spot_increaser};
                if (Gxy_sum_final_Blue < soft_spot_increaser) 
                {Gxy_sum_final_Blue = soft_spot_increaser};
                //ADD THIS?:
                
                
                //step 4: decrease hard spots - need fix?
                //let hard_spot_reducer = 160; //slider (128-255)
                //hard_spot_reducer = (Gxy_sum_final_Red + Gxy_sum_final_Green + Gxy_sum_final_Blue)/3 * (1.5); //auto mode
                if (Gxy_sum_final_Red > hard_spot_reducer) 
                {Gxy_sum_final_Red = hard_spot_reducer};
                if (Gxy_sum_final_Green > hard_spot_reducer) 
                {Gxy_sum_final_Green = hard_spot_reducer};
                if (Gxy_sum_final_Blue > hard_spot_reducer) 
                {Gxy_sum_final_Blue = hard_spot_reducer};





                // // ////////corrections for custom RGB BG and shadow line colors submitted by users, then apply custom RGB shadow line colors, including black line mode, to underlying white lines

                // // ////step 1: increase low [custom RGB line colors] to match brightness level as [custom RGB background colors]
                //toggle on/off (background color matching: on/off)
                customlineshadowcolor_R += customBGcolor_R; 
                customlineshadowcolor_G += customBGcolor_G; 
                customlineshadowcolor_B += customBGcolor_B;

                

                // // // /////step 2: limit high [custom RGB line colors] to prevent from making white lines looking too bright. then, decrease all [custom RGB line colors] to balance  brightness while keeping desired custom RGB line colors' appearance 
                // // // or disable step 2 to get colored lines if done correctly
                // highestlimit = 50 * (customBGcolor_A/255);
                // let overbrightline_count = 0;

                // if (customlineshadowcolor_R > customBGcolor_R + highestlimit) 
                // {customlineshadowcolor_R = customBGcolor_R + highestlimit; }
                // if (customlineshadowcolor_G > customBGcolor_G + highestlimit) 
                // {customlineshadowcolor_G = customBGcolor_G + highestlimit; }
                // if (customlineshadowcolor_B > customBGcolor_B + highestlimit) 
                // {customlineshadowcolor_B = customBGcolor_B + highestlimit; }

                // overbrightline_count += customlineshadowcolor_R - customBGcolor_R;
                // overbrightline_count += customlineshadowcolor_G - customBGcolor_G;
                // overbrightline_count += customlineshadowcolor_B - customBGcolor_B;
                // overbrightline_count += highestlimit; //highestlimit * 1

                // let brightnessreducer = overbrightline_count/3; 
                // customlineshadowcolor_R = customlineshadowcolor_R - brightnessreducer;
                // customlineshadowcolor_G = customlineshadowcolor_G - brightnessreducer;
                // customlineshadowcolor_B = customlineshadowcolor_B - brightnessreducer;

                // //correction = needed
                // if (customlineshadowcolor_R > max) { customlineshadowcolor_R = 255; }
                // if (customlineshadowcolor_G > max) { customlineshadowcolor_G = 255; }
                // if (customlineshadowcolor_B > max) { customlineshadowcolor_B = 255; }
                // if (customlineshadowcolor_R < min) { customlineshadowcolor_R = 0; }
                // if (customlineshadowcolor_G < min) { customlineshadowcolor_G = 0; }
                // if (customlineshadowcolor_B < min) { customlineshadowcolor_B = 0; }




                

                // ////step 3: prepare variables that modify white (or soon-to-be black) underlying lines' original shadow colors, so they'll blend in with the [custom RGB background colors]
                let linecolor_tomatch_bgcolor_Red;
                let linecolor_tomatch_bgcolor_Green;
                let linecolor_tomatch_bgcolor_Blue;
                if (customlineshadowcolor_R >= 255) {customlineshadowcolor_R = 254;}
                if (customlineshadowcolor_G >= 255) {customlineshadowcolor_G = 254;}
                if (customlineshadowcolor_B >= 255) {customlineshadowcolor_B = 254;}
                // if (use_blackline === false) {     
                linecolor_tomatch_bgcolor_Red = 255/(255-customlineshadowcolor_R  *1); //*1 - *2 (2 = more grey lines to match BG colors, but need to further reduce excessive custom line colors)
                linecolor_tomatch_bgcolor_Green = 255/(255-customlineshadowcolor_G  *1);
                linecolor_tomatch_bgcolor_Blue = 255/(255-customlineshadowcolor_B  *1);
                // }
                // else if (use_blackline === true) {
                //    linecolor_tomatch_bgcolor_Red = 255/(customlineshadowcolor_R);
                //    linecolor_tomatch_bgcolor_Green = 255/(customlineshadowcolor_G);
                //    linecolor_tomatch_bgcolor_Blue = 255/(customlineshadowcolor_B);  
                // }
                
                
                // // ////step 4: Apply [custom RGB line colors] to white (or soon-to-be black) underlying lines, which will have shadow RGB colors that match [custom RGB background colors]
                Gxy_sum_final_Red *= linecolor_tomatch_bgcolor_Red; 
                Gxy_sum_final_Green *= linecolor_tomatch_bgcolor_Green; 
                Gxy_sum_final_Blue *= linecolor_tomatch_bgcolor_Blue;
              

                
                ////step 4.1: "0-255" correction - ncessary
                if (Gxy_sum_final_Blue > max) { Gxy_sum_final_Blue = 255; }
                if (Gxy_sum_final_Green > max) { Gxy_sum_final_Green = 255; }
                if (Gxy_sum_final_Red > max) { Gxy_sum_final_Red = 255; }
                if (Gxy_sum_final_Blue < min) { Gxy_sum_final_Blue = 0; }
                if (Gxy_sum_final_Green < min) { Gxy_sum_final_Green = 0; }
                if (Gxy_sum_final_Red < min) { Gxy_sum_final_Red = 0; }

                // // ////step 5: Instead of white lines (w/ desired highlight colors), generate black lines (by inverting underlying white lines w/ pre-inverted highlight colors into black lines w/ desired highlight colors))
                // if (use_blackline === true) {  
                //     Gxy_sum_final_Red = 255-Gxy_sum_final_Red;
                //     Gxy_sum_final_Green = 255-Gxy_sum_final_Green;
                //     Gxy_sum_final_Blue = 255-Gxy_sum_final_Blue;
                // }
               
                

            }
            //// step 5 
            if (use_blackline === true) {  
                Gxy_sum_final_Red = 255-Gxy_sum_final_Red;
                Gxy_sum_final_Green = 255-Gxy_sum_final_Green;
                Gxy_sum_final_Blue = 255-Gxy_sum_final_Blue;
            }


            

            // // //Restore black lines = not perfect, need to get rid of leftover light spots while keeping visible edges
            // let highestlimit2 = 64;
            // let darkshadeintensity = 0.33; //0-2
            
            // if (bw_avg_1 <= highestlimit2 && bw_avg_1 >= 0)// && bw_avg_1 > bw_avg_2 && ) 
            // {
            //     if ((bw_avg_1 >= bw_avg_2)) {
            //         if (use_blackline === false) {  
            //             data[formula+0] = customBGcolor_R - (highestlimit2-bw_avg_1)*darkshadeintensity; 
            //             data[formula+1] = customBGcolor_G - (highestlimit2-bw_avg_1)*darkshadeintensity;
            //             data[formula+2] = customBGcolor_B - (highestlimit2-bw_avg_1)*darkshadeintensity;
            //         }
            //         else if (use_blackline === true) {
            //             data[formula+0] = 255-customBGcolor_R - (highestlimit2-bw_avg_1)*darkshadeintensity; 
            //             data[formula+1] = 255-customBGcolor_G - (highestlimit2-bw_avg_1)*darkshadeintensity;
            //             data[formula+2] = 255-customBGcolor_B - (highestlimit2-bw_avg_1)*darkshadeintensity;   
            //         }
            //         continue;
            //     }
            // }



            // if (bw_avg_1 <= highestlimit2 && bw_avg_1 > bw_avg_2 && bw_avg_1 >= 1)  {
            //     // data[formula+0] = customBGcolor_R * ((255)-trio5)/(255);
            //     // data[formula+1] = customBGcolor_G * ((255)-trio5)/(255);
            //     // data[formula+2] = customBGcolor_B * ((255)-trio5)/(255);
            //     data[formula+0] = customBGcolor_R * 0.8;
            //     data[formula+1] = customBGcolor_G * 0.8;
            //     data[formula+2] = customBGcolor_B * 0.8;
            //     continue;
            // }



            // //line 2: - grayscale with color lines____
            // ////grayscale - line 2 (optional)__
            // let bwcolor1 = (Gxy_sum_final_Red + Gxy_sum_final_Green + Gxy_sum_final_Blue)/3;
            // Gxy_sum_final_Red = bwcolor1;
            // Gxy_sum_final_Green = bwcolor1;
            // Gxy_sum_final_Blue = bwcolor1;
            // let bwcolor2 = (((imageData_original2_data_1d[formula+0] + imageData_original2_data_1d[formula+1] + imageData_original2_data_1d[formula+2]) / 3));
            // //add shade
            // if (bwcolor2 >= bwcolor1)
            // {
            //     Gxy_sum_final_Green = bwcolor2;
            //     Gxy_sum_final_Red = bwcolor2;
            // }
            // Gxy_sum_final_Blue = bwcolor2;
             

            ////line 3 - grayscale with color lines____
            ////grayscale - line 3 (optional)__
            // let bwcolor1 = (Gxy_sum_final_Red + Gxy_sum_final_Green + Gxy_sum_final_Blue)/3;
            // Gxy_sum_final_Red = bwcolor1;
            // Gxy_sum_final_Green = bwcolor1;
            // Gxy_sum_final_Blue = bwcolor1;
            // let bwcolor2 = (((imageData_original2_data_1d[formula+0] + imageData_original2_data_1d[formula+1] + imageData_original2_data_1d[formula+2]) / 3));
            // //add shade
            // if (bwcolor2 >= bwcolor1)
            // {
            //     Gxy_sum_final_Green = bwcolor2;
            //     Gxy_sum_final_Red = bwcolor2;
            // }
            // Gxy_sum_final_Blue = bwcolor2;
            
            

            data[formula]     = Gxy_sum_final_Red;    // red
            data[formula + 1] = Gxy_sum_final_Green;  // green
            data[formula + 2] = Gxy_sum_final_Blue;   // blue
            data[formula + 3] = val_Alpha;            // alpha


            }

        }
    }

    console.log("counter1: " + counter1);
    ctx.putImageData(imageData, 0, 0);
}