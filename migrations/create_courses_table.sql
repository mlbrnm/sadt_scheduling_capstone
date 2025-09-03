-- Create Course table with audit columns
CREATE TABLE IF NOT EXISTS courses (
    course_id VARCHAR(50) PRIMARY KEY,
    course_code VARCHAR(50) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    program_major VARCHAR(255),
    group_name VARCHAR(50),          
    credits DECIMAL(4,2),            
    course_hours INT,                
    modality VARCHAR(50),              
    program_type VARCHAR(100),          
    credential VARCHAR(100),            
    req_elec VARCHAR(50),               
    delivery_method VARCHAR(100),       
    ac_name VARCHAR(255),               
    school VARCHAR(255),                
    exam_otr VARCHAR(50),              
    semester VARCHAR(10),
    fall VARCHAR(1) CHECK (fall IN ('Y', 'N')),
    winter VARCHAR(1) CHECK (winter IN ('Y', 'N')),
    spring_summer VARCHAR(1) CHECK (spring_summer IN ('Y', 'N')),
    "order" INT,                     
    duration_days INT,                  
    notes TEXT,
    uploaded_by VARCHAR(255),           
    uploaded_at VARCHAR(50)
);

-- Enable Row-Level Security
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Policy to allow any authenticated user to read courses
CREATE POLICY "Allow authenticated users to read courses" 
ON public.courses
FOR SELECT
USING (auth.role() IS NOT NULL);

-- Policy to allow service role (backend) to insert courses
CREATE POLICY "Service role can insert courses" 
ON public.courses
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Policy to allow service role (backend) to update courses
CREATE POLICY "Service role can update courses" 
ON public.courses
FOR UPDATE
USING (auth.role() = 'service_role');

-- Policy to allow service role (backend) to delete courses if needed
CREATE POLICY "Service role can delete courses" 
ON public.courses
FOR DELETE
USING (auth.role() = 'service_role');
