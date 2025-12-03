"""
Gradio UI Module
Handles the web interface and API endpoints
"""

import gradio as gr
from ai_features import AnnouncementGenerator


class GradioApp:
    """Gradio application wrapper"""
    
    def __init__(self, generator: AnnouncementGenerator = None):
        """
        Initialize Gradio app.
        
        Args:
            generator: AnnouncementGenerator instance (creates new one if not provided)
        """
        self.generator = generator or AnnouncementGenerator()
    
    def generate_announcements_ui(
        self, 
        audience: str, 
        instruction: str
    ) -> str:
        """
        Gradio UI handler function.
        
        Args:
            audience: Selected audience
            instruction: User instruction text
            
        Returns:
            Pretty-printed JSON string
        """
        return self.generator.generate_json_string(audience, instruction, creativity=0.5)
    
    def create_interface(self) -> gr.Blocks:
        """
        Create and configure the Gradio Blocks interface.
        
        Returns:
            Gradio Blocks app
        """
        with gr.Blocks(title="Announcement Generator") as app:
            gr.Markdown("# 📢 Announcement Generator")
            gr.Markdown("Generate 3 professional announcement variations using AI")
            
            with gr.Row():
                with gr.Column():
                    audience_dropdown = gr.Dropdown(
                        choices=["students", "administrative staff", "both"],
                        value="students",
                        label="Target Audience",
                        info="Who should this announcement reach?"
                    )
                    
                    instruction_textbox = gr.Textbox(
                        label="Announcement Instruction",
                        placeholder="Enter the full announcement text or key details...",
                        lines=5,
                        info="Provide the main content or topic for the announcement"
                    )
                    
                    generate_button = gr.Button("🚀 Generate 3 Announcements", variant="primary")
                
                with gr.Column():
                    output_textbox = gr.Textbox(
                        label="Generated Announcements (JSON)",
                        lines=20,
                        max_lines=30,
                        info="Copy this JSON for use in your application"
                    )
            
            gr.Markdown("""
            ### 📋 Features:
            - Generates 3 unique variations
            - Content moderation included
            - JSON schema validation
            - Max 300 words per announcement
            - English-only output
            
            ### 🔌 API Endpoint:
            - **POST** `/api/generate`
            - **Body**: `{"audience": "students", "instruction": "...", "creativity": 0.4}`
            """)
            
            # Wire up the button
            generate_button.click(
                fn=self.generate_announcements_ui,
                inputs=[audience_dropdown, instruction_textbox],
                outputs=output_textbox
            )
        
        return app
    
    def launch(
        self, 
        server_name: str = "0.0.0.0",
        server_port: int = 7860,
        share: bool = False
    ):
        """
        Launch the Gradio application.
        
        Args:
            server_name: Server host address
            server_port: Server port number
            share: Whether to create a public link
        """
        app = self.create_interface()
        app.launch(
            server_name=server_name,
            server_port=server_port,
            share=share
        )
