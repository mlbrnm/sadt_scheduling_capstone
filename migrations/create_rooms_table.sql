CREATE TABLE rooms (
    room_id INT PRIMARY KEY AUTO_INCREMENT,
    room_type_requested VARCHAR(50),
    pavilion_requested VARCHAR(50),
    room_number VARCHAR(20),
    room_type_assigned VARCHAR(50),
    room_description VARCHAR(255)
);
-- Allow any authenticated user to read rooms
CREATE POLICY "Allow authenticated users to read rooms" 
ON public.rooms
FOR SELECT
USING (auth.role() IS NOT NULL);

-- Allow backend service to insert rooms
CREATE POLICY "Service role can insert rooms" 
ON public.rooms
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Allow backend service to update rooms
CREATE POLICY "Service role can update rooms" 
ON public.rooms
FOR UPDATE
USING (auth.role() = 'service_role');

-- Allow backend service to delete rooms
CREATE POLICY "Service role can delete rooms" 
ON public.rooms
FOR DELETE
USING (auth.role() = 'service_role');
